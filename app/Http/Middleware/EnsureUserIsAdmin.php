<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Hard gate for admin-only controllers.
 * RestrictNormalUserAccess handles routing redirects.
 * This middleware adds a server-side abort so even if a route is
 * accidentally added without restrict.normal, admin actions still fail safely.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || Auth::user()->usertype != 1) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Unauthorised.'], 403);
            }
            abort(403, 'Unauthorised.');
        }

        return $next($request);
    }
}
