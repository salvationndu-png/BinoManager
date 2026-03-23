<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * TenantScope
 *
 * Automatically appends `WHERE tenant_id = ?` to every Eloquent query
 * on models that use the BelongsToTenant trait.
 *
 * The tenant_id is resolved from the application container, where it was
 * placed by the InitializeTenancy middleware.  If no tenant is bound
 * (e.g. during artisan commands) the scope is silently skipped so
 * maintenance tasks still work.
 */
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (! app()->bound('current.tenant.id')) {
            return;
        }
        
        $tenantId = app()->make('current.tenant.id');

        if ($tenantId !== null) {
            $builder->where($model->getTable() . '.tenant_id', $tenantId);
        }
    }
}
