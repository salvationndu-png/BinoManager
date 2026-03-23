<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, ...$guards): mixed
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                if ($user && $user->tenant_id) {
                    $tenant = Tenant::find($user->tenant_id);
                    if ($tenant && !$tenant->trashed()) {
                        return redirect('/' . $tenant->slug . '/home');
                    }
                }

                return redirect('/');
            }
        }

        return $next($request);
    }
}