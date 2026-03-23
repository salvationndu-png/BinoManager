<?php

namespace App\Http\Controllers\Concerns;

/**
 * RequiresTenant
 *
 * Convenience accessor for controllers that need the current tenant.
 * The tenant is guaranteed to exist when this is called because:
 *   - InitializeTenancy middleware has already resolved and bound it
 *   - CheckTenantSubscription has verified the user belongs to it
 *
 * If called with no tenant bound (should never happen in normal flow)
 * a clear exception is thrown so the developer knows exactly what's wrong.
 */
trait RequiresTenant
{
    protected function tenant(): \App\Models\Tenant
    {
        $tenant = app()->bound('current.tenant') ? app()->make('current.tenant') : null;

        if (! $tenant) {
            $isLocal = config('app.env') === 'local'
                    && config('tenancy.central_domain') === 'localhost';

            if ($isLocal) {
                abort(403,
                    'No workspace context. ' .
                    'Visit: http://localhost:8000/login?tenant=YOUR-SLUG ' .
                    'or http://localhost:8000/register-workspace to create one.'
                );
            }

            abort(403, 'No workspace context.');
        }

        return $tenant;
    }
}
