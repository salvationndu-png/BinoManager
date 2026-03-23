<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Subscription;

class PaymentEvent extends Model
{
    protected $fillable = [
        'tenant_id', 'paystack_event_id', 'event_type',
        'payload', 'status', 'error_message', 'processed_at',
    ];

    protected $casts = [
        'payload'      => 'array',
        'processed_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function subscription()
    {
        // Link via paystack_subscription_code stored in payload
        return $this->belongsTo(Subscription::class, 'tenant_id', 'tenant_id')
            ->where('status', 'active')->latest();
    }

    // Convenience accessor for the Naira amount
    public function getAmountAttribute(): float
    {
        return ($this->payload['data']['amount'] ?? 0) / 100;
    }

    public function getPaystackReferenceAttribute(): ?string
    {
        return $this->payload['data']['reference'] ?? null;
    }
}
