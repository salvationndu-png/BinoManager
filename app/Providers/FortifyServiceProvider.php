<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Http\Requests\CustomLoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;
use Illuminate\Support\ServiceProvider;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind custom LoginResponse
        $this->app->singleton(
            \Laravel\Fortify\Contracts\LoginResponse::class,
            \App\Http\Responses\LoginResponse::class
        );
    }

    public function boot(): void
    {
        // ── Post-login redirect ────────────────────────────────────────────
        // On localhost we write the slug to the session HERE (after Fortify
        // has authenticated the user and the tenant is already bound) so all
        // subsequent page loads — /team, /settings, /billing, etc. — can
        // resolve the tenant without needing ?tenant= in the URL.
        Fortify::redirects('login', function () {
            // Get tenant from authenticated user
            $user = auth()->user();
            
            \Log::info('Login redirect', [
                'user_id' => $user?->id ?? 'NULL',
                'tenant_id' => $user?->tenant_id ?? 'NULL',
            ]);
            
            if ($user && $user->tenant_id) {
                $tenant = \App\Models\Tenant::find($user->tenant_id);
                if ($tenant && !$tenant->trashed()) {
                    // Persist to session
                    session(['_bino_tenant' => $tenant->slug]);
                    
                    $redirectUrl = '/' . $tenant->slug . '/home';
                    \Log::info('Redirecting to', ['url' => $redirectUrl]);
                    return $redirectUrl;
                }
            }

            \Log::info('No tenant found, redirecting to HOME constant');
            return RouteServiceProvider::HOME;
        });

        // ── Login view ─────────────────────────────────────────────────────
        Fortify::loginView(function () {
            return view('auth.login-react');
        });

        // ── Bind custom login request ──────────────────────────────────────
        $this->app->bind(
            \Laravel\Fortify\Http\Requests\LoginRequest::class,
            CustomLoginRequest::class
        );

        Fortify::username(fn () => 'email');

        // ── Tenant-scoped authentication ───────────────────────────────────
        // Email + password login with automatic tenant resolution
        Fortify::authenticateUsing(function (Request $request) {
            \Log::info('Login attempt', [
                'email' => $request->email,
                'has_password' => $request->filled('password'),
                'tenant_bound' => app()->bound('current.tenant'),
            ]);

            if (! $request->filled('email') || ! $request->filled('password')) {
                \Log::info('Missing email or password');
                return null;
            }

            $tenant = app()->bound('current.tenant') ? app('current.tenant') : null;
            $isLocal = config('app.env') === 'local';

            // Find user by email
            $user = \App\Models\User::where('email', $request->email)->first();

            if (! $user) {
                \Log::info('User not found', ['email' => $request->email]);
                return null;
            }

            \Log::info('User found', ['user_id' => $user->id, 'tenant_id' => $user->tenant_id]);

            // Verify password
            if (! Hash::check($request->password, $user->password)) {
                \Log::info('Password mismatch');
                return null;
            }

            \Log::info('Password verified');

            // Check if user is deactivated
            if ($user->status == 0) {
                \Log::info('User deactivated');
                return null;
            }

            // If tenant context exists, verify user belongs to this tenant
            if ($tenant && (int)$user->tenant_id !== (int)$tenant->id) {
                \Log::info('Tenant mismatch', ['user_tenant' => $user->tenant_id, 'current_tenant' => $tenant->id]);
                return null;
            }

            // If no tenant context, bind user's tenant (for central domain login)
            if (! $tenant) {
                $userTenant = \App\Models\Tenant::find($user->tenant_id);
                if ($userTenant && ! $userTenant->trashed()) {
                    app()->instance('current.tenant', $userTenant);
                    app()->instance('current.tenant.id', $userTenant->id);
                    
                    // Persist to session for all environments
                    session(['_bino_tenant' => $userTenant->slug]);
                    \Log::info('Tenant bound', ['tenant_slug' => $userTenant->slug]);
                }
            }

            \Log::info('Login successful');
            return $user;
        });

        // ── Standard Fortify actions ───────────────────────────────────────
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        // ── Rate limiting ──────────────────────────────────────────────────
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(Str::lower($request->ip()));
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
