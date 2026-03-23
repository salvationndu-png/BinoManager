<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RestrictNormalUserAccess
{
    /**
     * Paths that sales users (usertype = 0) are allowed to access.
     * Supports wildcard patterns via fnmatch().
     */
    protected array $allowedPaths = [
        'home',
        'app',
        'sales',
        'track',
        'analytics',
        'analytics/profit-loss',
        'analytics/inventory-valuation',
        'add-sale',
        'track-sales-data',
        'get-product-details/*',
        'get-product-quantity/*',
        'customers-for-sales',
        'products-list',
        'api/dashboard',
        'user/profile',
        'billing',
        'billing/*',
    ];

    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user->usertype == 0) {
            $currentPath = $request->path();

            foreach ($this->allowedPaths as $allowed) {
                if (fnmatch($allowed, $currentPath)) {
                    return $next($request);
                }
            }

            return redirect('home')
                ->with('error', 'Access denied. You are not authorised to view this page.');
        }

        return $next($request);
    }
}
