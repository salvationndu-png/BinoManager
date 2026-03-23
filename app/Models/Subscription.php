<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'tenant_id', 'plan_id', 'paystack_subscription_code',
        'paystack_email_token', 'status', 'starts_at', 'ends_at',
        'cancelled_at', 'next_payment_date', 'amount_kobo',
    ];

    protected $casts = [
        'starts_at'         => 'datetime',
        'ends_at'           => 'datetime',
        'cancelled_at'      => 'datetime',
        'next_payment_date' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
