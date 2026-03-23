<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'billing_cycle', 'price_kobo', 'max_users',
        'max_products', 'features', 'is_active', 'is_popular', 'sort_order',
    ];

    protected $casts = [
        'features'   => 'array',
        'is_active'  => 'boolean',
        'is_popular' => 'boolean',
        'price_kobo' => 'integer',
        'max_users' => 'integer',
        'max_products' => 'integer',
    ];

    // ── Accessors ──────────────────────────────────────────────────────────

    /**
     * Price formatted in Naira for display.
     */
    public function getPriceNairaAttribute(): string
    {
        return '₦' . number_format($this->price_kobo / 100, 0);
    }

    /**
     * Monthly equivalent price for annual plans.
     */
    public function getMonthlyEquivalentAttribute(): string
    {
        if ($this->billing_cycle === 'annual') {
            $monthlyPrice = ($this->price_kobo / 12) / 100;
            return '₦' . number_format($monthlyPrice, 0);
        }
        return $this->price_naira;
    }

    /**
     * Calculate savings for annual plans.
     */
    public function getAnnualSavingsAttribute(): int
    {
        if ($this->billing_cycle === 'annual') {
            // Find corresponding monthly plan
            $monthlyPlan = self::where('name', $this->name)
                ->where('billing_cycle', 'monthly')
                ->first();
            
            if ($monthlyPlan) {
                $monthlyYearlyCost = $monthlyPlan->price_kobo * 12;
                return ($monthlyYearlyCost - $this->price_kobo) / 100;
            }
        }
        return 0;
    }

    // ── Scopes ─────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    // ── Relationships ──────────────────────────────────────────────────────

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    public function hasUnlimitedUsers(): bool
    {
        return $this->max_users <= 0;
    }

    public function hasUnlimitedProducts(): bool
    {
        return $this->max_products <= 0;
    }
}
