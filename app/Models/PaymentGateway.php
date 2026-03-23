<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class PaymentGateway extends Model
{
    protected $fillable = [
        'name', 'slug', 'is_active', 'public_key', 'secret_key',
        'webhook_secret', 'currency', 'config'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config' => 'array',
    ];

    // Encrypt sensitive keys
    public function setSecretKeyAttribute($value)
    {
        $this->attributes['secret_key'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getSecretKeyAttribute($value)
    {
        try {
            return $value ? Crypt::decryptString($value) : null;
        } catch (\Exception $e) {
            \Log::error('Failed to decrypt secret_key', ['gateway_id' => $this->id]);
            return null;
        }
    }

    public function setPublicKeyAttribute($value)
    {
        $this->attributes['public_key'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getPublicKeyAttribute($value)
    {
        try {
            return $value ? Crypt::decryptString($value) : null;
        } catch (\Exception $e) {
            \Log::error('Failed to decrypt public_key', ['gateway_id' => $this->id]);
            return null;
        }
    }

    public function setWebhookSecretAttribute($value)
    {
        $this->attributes['webhook_secret'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getWebhookSecretAttribute($value)
    {
        try {
            return $value ? Crypt::decryptString($value) : null;
        } catch (\Exception $e) {
            \Log::error('Failed to decrypt webhook_secret', ['gateway_id' => $this->id]);
            return null;
        }
    }

    // Get masked version for display
    public function getMaskedSecretKey()
    {
        $key = $this->secret_key;
        if (!$key) return null;
        return substr($key, 0, 8) . str_repeat('*', max(0, strlen($key) - 12)) . substr($key, -4);
    }

    public function getMaskedPublicKey()
    {
        $key = $this->public_key;
        if (!$key) return null;
        return substr($key, 0, 8) . str_repeat('*', max(0, strlen($key) - 12)) . substr($key, -4);
    }

    public function getMaskedWebhookSecret()
    {
        $key = $this->webhook_secret;
        if (!$key) return null;
        return substr($key, 0, 6) . str_repeat('*', max(0, strlen($key) - 10)) . substr($key, -4);
    }

    // Check if keys are configured
    public function hasKeys()
    {
        return !empty($this->secret_key) && !empty($this->public_key);
    }

    // Get active gateway
    public static function active()
    {
        return static::where('is_active', true)->first();
    }

    // Scope for active gateways
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
