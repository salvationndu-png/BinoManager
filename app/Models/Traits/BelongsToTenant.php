<?php

namespace App\Models\Traits;

use App\Models\Scopes\TenantScope;

/**
 * BelongsToTenant
 *
 * Apply this trait to any Eloquent model that holds per-tenant data.
 * It does two things:
 *
 *  1. Registers a global scope so EVERY query is automatically filtered
 *     by the currently resolved tenant_id.  This is the primary security
 *     boundary — no tenant can ever see another tenant's rows.
 *
 *  2. Hooks into the `creating` event to stamp tenant_id on every new
 *     record, so controllers never need to set it manually (and can't
 *     accidentally forget).
 *
 * Security note: tenant_id is NEVER accepted from user-supplied input.
 * It is resolved entirely from the authenticated session context.
 */
trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        // 1. Auto-filter all queries
        static::addGlobalScope(new TenantScope());

        // 2. Auto-stamp on create
        static::creating(function ($model) {
            if (empty($model->tenant_id)) {
                if (! app()->bound('current.tenant.id')) {
                    throw new \RuntimeException(
                        'Attempted to create [' . static::class . '] with no tenant context. ' .
                        'Ensure InitializeTenancy middleware has run.'
                    );
                }
                
                $tenantId = app('current.tenant.id');

                if (! $tenantId) {
                    throw new \RuntimeException(
                        'Attempted to create [' . static::class . '] with no tenant context. ' .
                        'Ensure InitializeTenancy middleware has run.'
                    );
                }

                $model->tenant_id = $tenantId;
            }
        });
    }

    /**
     * Temporarily bypass the tenant scope (for super-admin queries only).
     * Usage: Model::withoutTenantScope()->all()
     */
    public static function withoutTenantScope()
    {
        return static::withoutGlobalScope(TenantScope::class);
    }
}
