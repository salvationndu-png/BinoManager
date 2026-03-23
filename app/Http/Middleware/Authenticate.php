<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            // Super admin routes should redirect to super admin login
            if ($request->is('superadmin') || $request->is('superadmin/*')) {
                return route('superadmin.login');
            }
            
            $tenant = $request->get('tenant');
            return $tenant ? '/login?tenant=' . $tenant : route('login');
        }
    }
}
