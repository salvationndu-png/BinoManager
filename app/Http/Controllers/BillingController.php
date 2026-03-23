<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    use RequiresTenant;
    
    public function index()
    {
        $tenant = $this->tenant();
        $plans  = Plan::active()->get();

        $activeSubscription = $tenant->activeSubscription;
        $paymentEvents = \App\Models\PaymentEvent::where('tenant_id', $tenant->id)
            ->where('event_type', 'charge.success')
            ->select('id', 'payload', 'processed_at')
            ->latest('processed_at')
            ->limit(12)
            ->get();

        return view('tenant.billing', compact('tenant', 'plans', 'activeSubscription', 'paymentEvents'));
    }

    /**
     * Initiate a payment gateway checkout.
     * Security: plan_id validated against DB; amount never comes from client.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $tenant = $this->tenant();
        $plan   = Plan::findOrFail($request->plan_id);
        $gateway = PaymentGateway::active();

        if (!$gateway) {
            return back()->with('error', 'Payment gateway not configured. Please contact support.');
        }

        if (!$gateway->secret_key) {
            return back()->with('error', 'Payment gateway keys not configured. Please contact support.');
        }

        // Route to appropriate gateway
        switch ($gateway->slug) {
            case 'paystack':
                return $this->checkoutPaystack($tenant, $plan, $gateway);
            case 'stripe':
                return $this->checkoutStripe($tenant, $plan, $gateway);
            case 'flutterwave':
                return $this->checkoutFlutterwave($tenant, $plan, $gateway);
            default:
                return back()->with('error', 'Unsupported payment gateway.');
        }
    }

    private function checkoutPaystack($tenant, $plan, $gateway)
    {
        $response = Http::withToken($gateway->secret_key)
            ->post('https://api.paystack.co/transaction/initialize', [
                'email'        => $tenant->email,
                'amount'       => $plan->price_kobo,
                'currency'     => $gateway->currency,
                'plan'         => null,
                'metadata'     => [
                    'tenant_id' => $tenant->id,
                    'plan_id'   => $plan->id,
                    'action'    => 'subscribe',
                ],
                'callback_url' => route('billing.verify', ['tenant_slug' => $tenant->slug]),
            ]);

        if (! $response->successful() || ! $response->json('status')) {
            Log::error('Paystack checkout failed', [
                'tenant_id' => $tenant->id,
                'response'  => $response->json(),
            ]);
            return back()->with('error', 'Could not connect to payment gateway. Please try again.');
        }

        return redirect($response->json('data.authorization_url'));
    }

    private function checkoutStripe($tenant, $plan, $gateway)
    {
        // Stripe implementation placeholder
        return back()->with('error', 'Stripe integration coming soon.');
    }

    private function checkoutFlutterwave($tenant, $plan, $gateway)
    {
        // Flutterwave implementation placeholder
        return back()->with('error', 'Flutterwave integration coming soon.');
    }

    /**
     * Verify payment after gateway redirects back.
     * Security: reference comes from query string but we verify server-side with gateway.
     */
    public function verify(Request $request)
    {
        $request->validate(['reference' => 'required|string|max:100|regex:/^[a-zA-Z0-9_\-]+$/']);

        $gateway = PaymentGateway::active();
        
        if (!$gateway) {
            return redirect()->route('billing', ['tenant_slug' => $this->tenant()->slug])->with('error', 'Payment gateway not configured.');
        }

        // Route to appropriate gateway verification
        switch ($gateway->slug) {
            case 'paystack':
                return $this->verifyPaystack($request, $gateway);
            case 'stripe':
                return $this->verifyStripe($request, $gateway);
            case 'flutterwave':
                return $this->verifyFlutterwave($request, $gateway);
            default:
                return redirect()->route('billing', ['tenant_slug' => $this->tenant()->slug])->with('error', 'Unsupported payment gateway.');
        }
    }

    private function verifyPaystack($request, $gateway)
    {
        $response = Http::withToken($gateway->secret_key)
            ->get('https://api.paystack.co/transaction/verify/' . $request->reference);

        if (! $response->successful()) {
            return redirect()->route('billing', ['tenant_slug' => $this->tenant()->slug])->with('error', 'Could not verify payment.');
        }

        $data = $response->json('data');

        if ($data['status'] !== 'success') {
            return redirect()->route('billing', ['tenant_slug' => $this->tenant()->slug])->with('error', 'Payment was not completed.');
        }

        $tenant = $this->tenant();
        $meta   = $data['metadata'] ?? [];

        if ((int) ($meta['tenant_id'] ?? 0) !== $tenant->id) {
            Log::warning('Mismatched tenant on payment verify', [
                'claimed'  => $meta['tenant_id'] ?? null,
                'actual'   => $tenant->id,
                'reference' => $request->reference,
            ]);
            abort(403, 'Transaction does not belong to this workspace.');
        }

        $plan = Plan::find($meta['plan_id'] ?? null);

        if ($plan) {
            $this->activateTenantPlan($tenant, $plan, $data);
        }

        return redirect()->route('home', ['tenant_slug' => $tenant->slug])->with('success', 'Subscription activated! Welcome to ' . $plan?->name . '.');
    }

    private function verifyStripe($request, $gateway)
    {
        return redirect()->route('billing', ['tenant_slug' => $this->tenant()->slug])->with('error', 'Stripe verification coming soon.');
    }

    private function verifyFlutterwave($request, $gateway)
    {
        return redirect()->route('billing', ['tenant_slug' => $this->tenant()->slug])->with('error', 'Flutterwave verification coming soon.');
    }

    private function activateTenantPlan(Tenant $tenant, Plan $plan, array $paystackData): void
    {
        $tenant->update([
            'status'  => 'active',
            'plan_id' => $plan->id,
        ]);

        // Calculate next payment date based on billing cycle
        $nextPaymentDate = $plan->billing_cycle === 'annual' 
            ? now()->addYear() 
            : now()->addMonth();

        Subscription::updateOrCreate(
            ['tenant_id' => $tenant->id, 'status' => 'active'],
            [
                'plan_id'      => $plan->id,
                'status'       => 'active',
                'starts_at'    => now(),
                'amount_kobo'  => $paystackData['amount'],
                'paystack_subscription_code' => $paystackData['authorization']['authorization_code'] ?? null,
                'next_payment_date' => $nextPaymentDate,
            ]
        );
    }
}
