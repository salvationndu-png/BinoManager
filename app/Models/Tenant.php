<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Tenant extends Model
{
    use HasFactory, SoftDeletes, Notifiable;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'plan_id',
        'status',
        'trial_ends_at',
        'grace_ends_at',
        'paystack_customer_code',
        'internal_notes',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'grace_ends_at' => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────────────────────

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
                    ->where('status', 'active')
                    ->latest();
    }

    public function settings()
    {
        return $this->hasOne(TenantSettings::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    // ── Status helpers ─────────────────────────────────────────────────────

    public function isOnTrial(): bool
    {
        return $this->status === 'trialing'
            && $this->trial_ends_at !== null
            && $this->trial_ends_at->isFuture();
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trialing']) && $this->isAccessible();
    }

    /**
     * Can this tenant access the app?
     * Covers: valid trial, active subscription, or within grace period.
     */
    public function isAccessible(): bool
    {
        if ($this->status === 'trialing' && $this->trial_ends_at?->isFuture()) {
            return true;
        }

        if ($this->status === 'active') {
            return true;
        }

        if ($this->status === 'grace' && $this->grace_ends_at?->isFuture()) {
            return true;
        }

        return false;
    }

    public function isInGrace(): bool
    {
        return $this->status === 'grace' && $this->grace_ends_at?->isFuture();
    }

    public function isSuspended(): bool
    {
        return in_array($this->status, ['suspended', 'cancelled']);
    }

    /**
     * Days remaining in trial (0 if expired or not trialing).
     */
    public function trialDaysLeft(): int
    {
        if (! $this->isOnTrial()) {
            return 0;
        }

        return (int) now()->diffInDays($this->trial_ends_at, false);
    }

    // ── Plan limit helpers ─────────────────────────────────────────────────

    public function canAddUser(): bool
    {
        $max = $this->plan?->max_users ?? 1;
        if ($max <= 0) return true; // 0 = unlimited

        return $this->users()->count() < $max;
    }

    public function canAddProduct(): bool
    {
        $max = $this->plan?->max_products ?? 50;
        if ($max <= 0) return true; // 0 = unlimited

        return Products::where('tenant_id', $this->id)->count() < $max;
    }

    // ── Slug validation ────────────────────────────────────────────────────

    /**
     * Generate a URL-safe slug from a business name.
     * Strips everything except lowercase letters, numbers, and hyphens.
     */
    public static function generateSlug(string $name): string
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        $slug = trim($slug, '-');

        // Check if slug is reserved
        $reserved = config('tenancy.reserved_slugs', []);
        if (in_array($slug, $reserved, true)) {
            $slug = $slug . '-business'; // Append suffix to make it unique
        }

        // Ensure uniqueness
        $base  = $slug;
        $count = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $count++;
        }

        return $slug;
    }
}
