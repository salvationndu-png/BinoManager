<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

/**
 * ImpersonateController
 *
 * Allows a super admin to log in as any tenant's admin user
 * for debugging and support purposes.
 *
 * Security guarantees:
 *  - Caller must be authenticated as super_admin (middleware enforced)
 *  - Target user must belong to specified tenant (cross-tenant protection)
 *  - Original super admin identity stored in session before switching
 *  - Every start and stop is logged to audit_logs with IP
 *  - Cannot impersonate a super admin (different guard entirely)
 *  - Session is regenerated to prevent fixation
 */
class ImpersonateController extends Controller
{
    private const SESSION_KEY = 'impersonating_as_super_admin_id';

    /**
     * Begin impersonation — switches the 'web' session to a tenant user.
     */
    public function start(Request $request, int $tenantId)
    {
        $tenant = Tenant::findOrFail($tenantId);

        // Find the first active admin in this tenant
        $targetUser = User::where('tenant_id', $tenant->id)
            ->where('usertype', 1)
            ->where('status', 1)
            ->orderBy('id')
            ->firstOrFail();

        $superAdminId = auth('super_admin')->id();

        // Store who we really are before switching
        session([self::SESSION_KEY => $superAdminId]);

        // Log in as the tenant admin via the 'web' guard
        Auth::guard('web')->login($targetUser);

        // Regenerate to prevent session fixation
        $request->session()->regenerate(true);

        // Put the super admin key back (regenerate clears it)
        session([self::SESSION_KEY => $superAdminId]);
        
        // Store tenant slug for localhost development
        session(['_bino_tenant' => $tenant->slug]);

        AuditLog::record(
            'impersonate.start',
            "Started impersonating {$targetUser->name} ({$tenant->name})",
            $tenant,
            [
                'target_user_id'    => $targetUser->id,
                'target_user_email' => $targetUser->email,
            ]
        );

        // Redirect to tenant home with path-based tenancy
        return redirect('/' . $tenant->slug . '/home')
            ->with('impersonating', true)
            ->with('impersonate_tenant', $tenant->name);
    }

    /**
     * Stop impersonation — returns to super admin session.
     */
    public function stop(Request $request)
    {
        $superAdminId = session(self::SESSION_KEY);

        if (! $superAdminId) {
            // Not impersonating — redirect to super admin panel
            return redirect()->route('superadmin.dashboard');
        }

        $impersonatedUser   = Auth::guard('web')->user();
        $impersonatedTenant = $impersonatedUser
            ? Tenant::find($impersonatedUser->tenant_id)
            : null;

        // Log out of impersonated account
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Re-authenticate as super admin
        $superAdmin = \App\Models\SuperAdmin::find($superAdminId);
        if ($superAdmin) {
            Auth::guard('super_admin')->login($superAdmin);

            AuditLog::record(
                'impersonate.stop',
                'Stopped impersonating ' . ($impersonatedTenant?->name ?? 'unknown tenant'),
                $impersonatedTenant
            );
        }

        return redirect()->route('superadmin.dashboard')
            ->with('success', 'Returned to super admin panel.');
    }
}
