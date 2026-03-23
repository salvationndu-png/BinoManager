<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    protected $fillable = [
        'super_admin_id', 'tenant_id', 'action',
        'description', 'context', 'ip_address', 'user_agent', 'created_at',
    ];

    protected $casts = [
        'context'    => 'array',
        'created_at' => 'datetime',
    ];
    
    // Disable updated_at since we only track creation
    const UPDATED_AT = null;

    public function superAdmin()
    {
        return $this->belongsTo(SuperAdmin::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Convenience method to log an action from anywhere.
     * Usage: AuditLog::record('tenant.suspend', 'Suspended Aba Traders', $tenant, [...])
     */
    public static function record(
        string   $action,
        string   $description,
        ?Tenant  $tenant = null,
        array    $context = []
    ): void {
        $superAdmin = auth('super_admin')->user();

        static::create([
            'super_admin_id' => $superAdmin?->id,
            'tenant_id'      => $tenant?->id,
            'action'         => $action,
            'description'    => $description,
            'context'        => $context ?: null,
            'ip_address'     => Request::ip(),
            'user_agent'     => substr(Request::userAgent() ?? '', 0, 255),
            'created_at'     => now(),
        ]);
    }
}
