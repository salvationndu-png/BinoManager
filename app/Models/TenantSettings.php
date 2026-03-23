<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantSettings extends Model
{
    protected $table = 'tenant_settings';

    protected $fillable = [
        'tenant_id', 'business_name', 'logo_path', 'address',
        'phone', 'receipt_footer', 'timezone', 'currency_symbol',
        'low_stock_threshold', 'notify_low_stock',
        'notify_daily_summary', 'notify_credit_reminder',
        'onboarding_completed_at', 'primary_color', 'secondary_color',
    ];

    protected $casts = [
        'notify_low_stock'          => 'boolean',
        'notify_daily_summary'      => 'boolean',
        'notify_credit_reminder'    => 'boolean',
        'onboarding_completed_at'   => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function onboardingComplete(): bool
    {
        return $this->onboarding_completed_at !== null;
    }
}
