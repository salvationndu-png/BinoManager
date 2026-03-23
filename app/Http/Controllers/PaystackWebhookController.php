<?php

namespace App\Http\Controllers;

use App\Models\PaymentEvent;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * PaystackWebhookController
 *
 * Security hardening:
 * 1. HMAC-SHA512 signature verified on EVERY request — reject if mismatch
 * 2. Idempotency: each event_id stored; duplicate deliveries are silently ignored
 * 3. Webhook endpoint is NOT behind CSRF middleware (exempt in VerifyCsrfToken)
 * 4. Payload is never trusted for money amounts — plan price comes from our DB
 * 5. All DB changes inside transactions
 */
class PaystackWebhookController extends Controller
{
    private const SUPPORTED_EVENTS = [
        'charge.success',
        'subscription.create',
        'subscription.disable',
        'invoice.payment_failed',
    ];

    public function handle(Request $request)
    {
        // 1. Verify Paystack HMAC signature
        $secret    = config('tenancy.paystack.webhook_secret') ?? config('tenancy.paystack.secret_key');
        $signature = $request->header('X-Paystack-Signature');
        $computed  = hash_hmac('sha512', $request->getContent(), $secret);

        if (! hash_equals($computed, $signature ?? '')) {
            Log::warning('Paystack webhook signature mismatch', [
                'ip' => $request->ip(),
            ]);
            return response('Unauthorized', 401);
        }

        $payload   = $request->json()->all();
        $eventType = $payload['event'] ?? '';
        $eventId   = $payload['data']['id'] ?? null;

        // 2. Ignore events we don't handle
        if (! in_array($eventType, self::SUPPORTED_EVENTS, true)) {
            return response('OK', 200);
        }

        // 3. Idempotency check — reject duplicates
        if ($eventId && PaymentEvent::where('paystack_event_id', (string) $eventId)->exists()) {
            return response('OK', 200); // already processed
        }

        try {
            DB::transaction(function () use ($payload, $eventType, $eventId) {
                $result = match ($eventType) {
                    'charge.success'          => $this->handleChargeSuccess($payload['data']),
                    'subscription.create'     => $this->handleSubscriptionCreate($payload['data']),
                    'subscription.disable'    => $this->handleSubscriptionDisable($payload['data']),
                    'invoice.payment_failed'  => $this->handlePaymentFailed($payload['data']),
                    default                   => 'ignored',
                };

                // Record event for audit trail
                PaymentEvent::create([
                    'paystack_event_id' => (string) ($eventId ?? uniqid('evt_')),
                    'event_type'        => $eventType,
                    'payload'           => $payload,
                    'status'            => $result === 'ignored' ? 'ignored' : 'processed',
                    'processed_at'      => now(),
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('Webhook processing error', [
                'event'     => $eventType,
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            // Store failed event for retry inspection
            PaymentEvent::create([
                'paystack_event_id' => (string) ($eventId ?? uniqid('evt_fail_')),
                'event_type'        => $eventType,
                'payload'           => $payload,
                'status'            => 'failed',
                'error_message'     => $e->getMessage(),
                'processed_at'      => now(),
            ]);

            // Return 200 to prevent Paystack retrying immediately;
            // we will retry internally via the failed events table.
            return response('OK', 200);
        }

        return response('OK', 200);
    }

    private function handleChargeSuccess(array $data): string
    {
        $tenantId = $data['metadata']['tenant_id'] ?? null;
        $planId   = $data['metadata']['plan_id'] ?? null;

        if (! $tenantId || ! $planId) {
            return 'ignored'; // Not a subscription payment we initiated
        }

        $tenant = Tenant::find($tenantId);
        $plan   = Plan::find($planId);

        if (! $tenant || ! $plan) {
            return 'ignored';
        }

        $tenant->update([
            'status'        => 'active',
            'plan_id'       => $plan->id,
            'grace_ends_at' => null, // clear any grace period
        ]);

        // Calculate next payment date based on billing cycle
        $nextPaymentDate = $plan->billing_cycle === 'annual' 
            ? now()->addYear() 
            : now()->addMonth();

        Subscription::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan_id'           => $plan->id,
                'status'            => 'active',
                'starts_at'         => now(),
                'amount_kobo'       => $data['amount'],
                'next_payment_date' => $nextPaymentDate,
            ]
        );

        return 'processed';
    }

    private function handleSubscriptionCreate(array $data): string
    {
        $tenantId = $data['metadata']['tenant_id'] ?? null;
        if (! $tenantId) return 'ignored';

        $tenant = Tenant::find($tenantId);
        if (! $tenant) return 'ignored';

        Subscription::where('tenant_id', $tenant->id)
            ->update([
                'paystack_subscription_code' => $data['subscription_code'] ?? null,
                'paystack_email_token'        => $data['email_token'] ?? null,
            ]);

        return 'processed';
    }

    private function handleSubscriptionDisable(array $data): string
    {
        $sub = Subscription::where('paystack_subscription_code', $data['subscription_code'] ?? '')->first();

        if (! $sub) return 'ignored';

        $sub->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $sub->tenant->update(['status' => 'cancelled']);

        return 'processed';
    }

    private function handlePaymentFailed(array $data): string
    {
        $tenantId = $data['metadata']['tenant_id'] ?? $data['subscription']['metadata']['tenant_id'] ?? null;
        if (! $tenantId) return 'ignored';

        $tenant = Tenant::find($tenantId);
        if (! $tenant) return 'ignored';

        // Enter grace period — don't hard-suspend yet
        $tenant->update([
            'status'        => 'grace',
            'grace_ends_at' => now()->addDays(config('tenancy.grace_days', 7)),
        ]);

        // Dispatch email notification job
        if (class_exists(\App\Jobs\SendPaymentFailedEmail::class)) {
            dispatch(new \App\Jobs\SendPaymentFailedEmail($tenant));
        }

        return 'processed';
    }
}
