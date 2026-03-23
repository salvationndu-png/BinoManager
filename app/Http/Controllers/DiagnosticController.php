<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RequiresTenant;
use App\Services\PlanEnforcementService;

class DiagnosticController extends Controller
{
    use RequiresTenant;

    public function planInfo()
    {
        $tenant = $this->tenant();
        $tenant->loadMissing('plan');
        
        $service = new PlanEnforcementService($tenant);
        
        return response()->json([
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
            'plan' => [
                'id' => $tenant->plan?->id,
                'name' => $tenant->plan?->name,
                'slug' => $tenant->plan?->slug,
                'billing_cycle' => $tenant->plan?->billing_cycle,
            ],
            'plan_features' => $service->planFeatures(),
            'usage_stats' => $service->usageStats(),
        ]);
    }
}
