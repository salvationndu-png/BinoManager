<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Super admin authentication — completely separate from tenant auth.
 * Uses the 'super_admin' guard backed by the super_admins table.
 *
 * Security hardening:
 *  - Throttled: 5 attempts per minute per IP before lockout
 *  - Locked accounts (is_active=0) rejected after auth check
 *  - Login time and IP stamped on every successful auth
 *  - Separate session — no cross-contamination with tenant sessions
 */
class AuthController extends Controller
{
    public function showLogin()
    {
        if (auth('super_admin')->check()) {
            return redirect('/superadmin');
        }
        return view('superadmin.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email|max:255',
            'password' => 'required|string|max:255',
        ]);

        // Rate limit: 5 attempts per minute per IP
        $throttleKey = 'superadmin_login:' . $request->ip();
        if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = \Illuminate\Support\Facades\RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Try again in {$seconds} seconds.",
            ]);
        }

        $request->session()->regenerate();

        if (! Auth::guard('super_admin')->attempt($credentials, $request->boolean('remember'))) {
            \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);

        $admin = auth('super_admin')->user();

        // Store admin ID manually in session as a guard-independent fallback
        session()->put('_super_admin_id', $admin->id);

        if (! $admin->is_active) {
            auth('super_admin')->logout();
            session()->forget('_super_admin_id');
            throw ValidationException::withMessages([
                'email' => 'This account has been deactivated.',
            ]);
        }

        // Stamp login time + IP for security audit
        $admin->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        AuditLog::record('superadmin.login', 'Super admin logged in');

        return redirect('/superadmin');
    }

    public function logout(Request $request)
    {
        AuditLog::record('superadmin.logout', 'Super admin logged out');
        auth('super_admin')->logout();
        session()->forget('_super_admin_id');
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('superadmin.login');
    }
}
