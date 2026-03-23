<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureSuperAdmin
 *
 * Guards all super admin routes.
 * Checks the 'super_admin' guard — completely separate from the tenant 'web' guard.
 * A logged-in tenant admin cannot bypass this by manipulating their session.
 *
 * Also enforces is_active flag — lets you disable a super admin account
 * without deleting it (preserves audit trail).
 */
class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        \Log::info('EnsureSuperAdmin check', [
            'authenticated' => auth('super_admin')->check(),
            'user_id' => auth('super_admin')->id(),
            'session_id' => session()->getId(),
            'path' => $request->path(),
        ]);
        
        $authenticated = auth('super_admin')->check()
            // Fallback: manual session flag set during login
            || session()->get('_super_admin_id') !== null;

        if (! $authenticated) {
            if ($request->expectsJson() || $request->is('superadmin/api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('superadmin.login')
                ->with('intended', $request->url());
        }

        // If guard didn't resolve the user but the session flag exists, load manually
        if (! auth('super_admin')->check() && session()->get('_super_admin_id')) {
            $adminId = session()->get('_super_admin_id');
            $admin   = \App\Models\SuperAdmin::find($adminId);
            if ($admin) {
                auth('super_admin')->setUser($admin);
            }
        }

        $admin = auth('super_admin')->user();

        if (! $admin->is_active) {
            auth('super_admin')->logout();
            if ($request->expectsJson() || $request->is('superadmin/api/*')) {
                return response()->json(['message' => 'Account deactivated.'], 403);
            }
            return redirect()->route('superadmin.login')
                ->with('error', 'Your super admin account has been deactivated.');
        }

        return $next($request);
    }
}
