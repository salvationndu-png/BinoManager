<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\PaymentEvent;
use App\Services\PlanEnforcementService;
use Illuminate\Support\Facades\Auth;

/**
 * Serves the React SPA shell.
 * Injects all data that the frontend needs as window.BinoManager props
 * so it doesn't need extra API calls on first load.
 */
class TenantAppController extends Controller
{
    use RequiresTenant;

    public function show()
    {
        $tenant = $this->tenant();
        $tenant->loadMissing(['plan', 'settings']);

        $plans              = [];
        $activeSubscription = null;
        $paymentEvents      = [];
        $planFeatures       = (new \App\Services\PlanEnforcementService($tenant))->planFeatures();

        if (Auth::user()->usertype == 1) {
            $plans = Plan::active()->get()->map(fn($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'slug'          => $p->slug,
                'price_monthly' => $p->price_kobo / 100,
                'price_kobo'    => $p->price_kobo,
                'max_users'     => $p->max_users,
                'max_products'  => $p->max_products,
                'features'      => $p->features ?? [],
            ]);

            $activeSubscription = $tenant->activeSubscription;

            $paymentEvents = PaymentEvent::where('tenant_id', $tenant->id)
                ->where('event_type', 'charge.success')
                ->latest('processed_at')
                ->limit(12)
                ->get(['id', 'payload', 'processed_at']);
        }

        return view('tenant-app', compact(
            'plans', 'activeSubscription', 'paymentEvents', 'planFeatures'
        ));
    }
}
