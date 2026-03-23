<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * CheckTenantSubscription
 *
 * Runs AFTER InitializeTenancy and the auth middleware.
 *
 * Responsibilities:
 *   1. Verify the authenticated user belongs to the current tenant.
 *      This is a second line of defence — if somehow a user from Tenant A
 *      holds a valid session while browsing Tenant B's subdomain, they are
 *      logged out immediately.  The BelongsToTenant global scope prevents
 *      data access, but this also prevents them from seeing the UI.
 *
 *   2. Block access when the tenant's subscription is not accessible
 *      (expired trial, failed payment, manual suspension).  Billing and
 *      logout paths remain accessible so the tenant can self-serve.
 */
class CheckTenantSubscription
{
    private const ALWAYS_ALLOWED = [
        'billing',
        'billing/checkout',
        'billing/verify',
        'billing/portal',
        'logout',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $tenant = app()->bound('current.tenant') ? app('current.tenant') : null;

        // No tenant context (central domain) — pass through
        if (! $tenant) {
            return $next($request);
        }

        // ── Security check: user must belong to this tenant ────────────────
        if (Auth::check()) {
            $user = Auth::user();

            if ((int) $user->tenant_id !== (int) $tenant->id) {
                // This user does not belong here.
                // Log them out and redirect to the central login so they can
                // choose the correct workspace. Do NOT expose which tenant exists.
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                // Clear stale dev session key
                session()->forget('_bino_tenant');

                return redirect('/')->withErrors([
                    'email' => 'Session mismatch. Please log in again.',
                ]);
            }
        }

        // ── Subscription / trial check ─────────────────────────────────────
        if ($tenant->isAccessible()) {
            // Warn but don't block during grace or trial
            if ($tenant->isInGrace()) {
                $graceDaysLeft = now()->diffInDays($tenant->grace_ends_at, false);
                view()->share('tenantGraceWarning', true);
                view()->share('tenantGraceDaysLeft', max(0, $graceDaysLeft));
            }
            if ($tenant->isOnTrial()) {
                view()->share('tenantTrialDaysLeft', $tenant->trialDaysLeft());
            }
            return $next($request);
        }

        // Always allow billing and logout even when suspended
        $path = ltrim($request->path(), '/');
        foreach (self::ALWAYS_ALLOWED as $allowed) {
            if ($path === $allowed || str_starts_with($path, $allowed . '/')) {
                return $next($request);
            }
        }

        return response()->view('tenant.suspended', [
            'tenant' => $tenant,
            'reason' => $this->suspensionReason($tenant),
        ], 402);
    }

    private function suspensionReason($tenant): string
    {
        return match ($tenant->status) {
            'cancelled' => 'cancelled',
            'suspended' => 'suspended',
            'trialing'  => 'trial_expired',
            default     => 'payment_failed',
        };
    }
}
