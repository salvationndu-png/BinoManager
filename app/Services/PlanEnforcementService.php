<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Products;
use App\Models\User;

/**
 * PlanEnforcementService
 *
 * Single place to check plan limits and feature gates before creating
 * resources or accessing features. Controllers call these methods and
 * get back a typed result object for consistent JSON error responses.
 *
 * Feature matrix:
 *  Starter    — 1 user, 50 products, sales + reports only
 *  Business   — 5 users, unlimited products, + analytics, customers, financials, team
 *  Enterprise — unlimited users + products, + custom branding
 */
class PlanEnforcementService
{
    // Features available per plan (cumulative — each plan includes lower tiers)
    private const PLAN_FEATURES = [
        'starter'    => ['sales', 'reports'],
        'business'   => ['sales', 'reports', 'analytics', 'customers', 'financials', 'team'],
        'enterprise' => ['sales', 'reports', 'analytics', 'customers', 'financials', 'team', 'branding'],
    ];

    public function __construct(private Tenant $tenant) {}

    // ── Resource limits ────────────────────────────────────────────────────

    public function canAddUser(): EnforcementResult
    {
        $plan = $this->tenant->plan;

        if (! $plan) {
            return EnforcementResult::denied(
                'No active plan. Please subscribe to add team members.',
                'no_plan'
            );
        }

        if ((int)$plan->max_users <= 0) return EnforcementResult::allowed(); // 0 = unlimited

        $current = User::where('tenant_id', $this->tenant->id)->count();

        if ($current >= $plan->max_users) {
            return EnforcementResult::denied(
                "Your {$plan->name} plan allows up to {$plan->max_users} user(s). "
                . "You have {$current}. Upgrade to add more.",
                'user_limit_reached',
                ['current' => $current, 'limit' => $plan->max_users, 'plan' => $plan->name]
            );
        }

        return EnforcementResult::allowed();
    }

    public function canAddProduct(): EnforcementResult
    {
        $plan = $this->tenant->plan;

        if (! $plan) {
            return EnforcementResult::denied(
                'No active plan. Please subscribe to add products.',
                'no_plan'
            );
        }

        if ((int)$plan->max_products <= 0) return EnforcementResult::allowed(); // 0 = unlimited

        $current = Products::where('tenant_id', $this->tenant->id)->count();

        if ($current >= $plan->max_products) {
            return EnforcementResult::denied(
                "Your {$plan->name} plan allows up to {$plan->max_products} products. "
                . "You have {$current}. Upgrade for unlimited products.",
                'product_limit_reached',
                ['current' => $current, 'limit' => $plan->max_products, 'plan' => $plan->name]
            );
        }

        return EnforcementResult::allowed();
    }

    // ── Feature gates ──────────────────────────────────────────────────────

    /**
     * Check if the tenant's plan includes a specific feature.
     * Feature keys: 'analytics', 'customers', 'financials', 'team', 'branding'
     */
    public function canAccess(string $feature): EnforcementResult
    {
        $plan = $this->tenant->plan;
        $slug = $plan?->slug ?? 'starter';
        // Normalize slug to handle monthly/annual variants
        $basePlan = preg_replace('/-(?:monthly|annual)$/', '', $slug);

        $allowed = self::PLAN_FEATURES[$basePlan] ?? self::PLAN_FEATURES['starter'];

        if (in_array($feature, $allowed)) {
            return EnforcementResult::allowed();
        }

        $requiredPlan = match(true) {
            in_array($feature, self::PLAN_FEATURES['business'])   => 'Business',
            in_array($feature, self::PLAN_FEATURES['enterprise'])  => 'Enterprise',
            default => 'a higher',
        };

        return EnforcementResult::denied(
            "This feature requires the {$requiredPlan} plan or higher. Upgrade to unlock it.",
            'feature_not_available',
            ['feature' => $feature, 'required_plan' => $requiredPlan, 'current_plan' => $plan?->name ?? 'None']
        );
    }

    public function canUseBranding(): EnforcementResult
    {
        return $this->canAccess('branding');
    }

    public function canUseTeam(): EnforcementResult
    {
        return $this->canAccess('team');
    }

    // ── Usage stats ────────────────────────────────────────────────────────

    public function usageStats(): array
    {
        $plan = $this->tenant->plan;
        $slug = $plan?->slug ?? 'starter';
        // Normalize slug to handle monthly/annual variants
        $basePlan = preg_replace('/-(?:monthly|annual)$/', '', $slug);

        $userCount    = User::where('tenant_id', $this->tenant->id)->count();
        $productCount = Products::where('tenant_id', $this->tenant->id)->count();

        return [
            'users' => [
                'current'   => $userCount,
                'limit'     => $plan?->max_users ?? 1,
                'unlimited' => ($plan?->max_users ?? 1) === 0,
            ],
            'products' => [
                'current'   => $productCount,
                'limit'     => $plan?->max_products ?? 50,
                'unlimited' => ($plan?->max_products ?? 50) === 0,
            ],
            'features' => self::PLAN_FEATURES[$basePlan] ?? self::PLAN_FEATURES['starter'],
        ];
    }

    /**
     * Return the full feature list for the current plan — used by the
     * frontend to gate pages without extra API calls.
     */
    public function planFeatures(): array
    {
        $slug = $this->tenant->plan?->slug ?? 'starter';
        // Normalize slug to handle monthly/annual variants (e.g., 'business-monthly' -> 'business')
        $basePlan = preg_replace('/-(?:monthly|annual)$/', '', $slug);
        return self::PLAN_FEATURES[$basePlan] ?? self::PLAN_FEATURES['starter'];
    }
}

/**
 * Simple value object for enforcement results.
 */
class EnforcementResult
{
    private function __construct(
        public readonly bool   $allowed,
        public readonly string $message = '',
        public readonly string $code    = '',
        public readonly array  $data    = [],
    ) {}

    public static function allowed(): self
    {
        return new self(true);
    }

    public static function denied(string $message, string $code = '', array $data = []): self
    {
        return new self(false, $message, $code, $data);
    }

    public function toJsonResponse(int $status = 402): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success'     => false,
            'message'     => $this->message,
            'error_code'  => $this->code,
            'upgrade_url' => url('/billing'),
            ...$this->data,
        ], $status);
    }
}
