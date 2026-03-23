<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantSettings;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class TenantRegistrationController extends Controller
{
    /**
     * Show the public signup form.
     */
    public function create()
    {
        $plans = Plan::active()->get();
        return view('tenant.register-react', compact('plans'));
    }

    /**
     * Handle signup form submission.
     *
     * Security:
     * - All inputs strictly validated with max-length caps
     * - Slug generated server-side; user never controls their subdomain directly
     * - Entire operation is one DB transaction — partial state impossible
     * - Reserved slugs blocked in Tenant::generateSlug()
     * - After creating, tenant slug is stored in session so the user
     *   never needs ?tenant= in subsequent requests on localhost
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:100',
            'owner_name'    => 'required|string|max:100',
            'email'         => 'required|email:rfc,dns|max:255|unique:users,email|unique:tenants,email',
            'phone'         => 'nullable|string|max:20',
            'password'      => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'plan_id'       => 'nullable|string',
        ]);

        // Sanitize text inputs
        $validated['business_name'] = InputSanitizer::sanitize($validated['business_name']);
        $validated['owner_name'] = InputSanitizer::sanitize($validated['owner_name']);
        if (isset($validated['phone'])) {
            $validated['phone'] = InputSanitizer::sanitize($validated['phone']);
        }

        // Map plan slug to plan ID - only allow active plans
        $planId = null;
        if (!empty($validated['plan_id'])) {
            $plan = Plan::where('slug', strtolower($validated['plan_id']))
                        ->where('is_active', true)
                        ->first();
            $planId = $plan ? $plan->id : null;
        }
        
        // Default to starter plan if no plan specified
        if (!$planId) {
            $planId = Plan::where('slug', 'business')->value('id');
        }

        $slug = Tenant::generateSlug($validated['business_name']);

        $tenant = DB::transaction(function () use ($validated, $slug, $planId) {
            // 1. Create tenant record
            $tenant = Tenant::create([
                'name'          => $validated['business_name'],
                'slug'          => $slug,
                'email'         => $validated['email'],
                'phone'         => $validated['phone'] ?? null,
                'plan_id'       => $planId,
                'status'        => 'trialing',
                'trial_ends_at' => now()->addDays(config('tenancy.trial_days', 14)),
            ]);

            // 2. Create the owner (admin user) scoped to this tenant.
            //    tenant_id is stamped here explicitly — never from user input.
            User::create([
                'tenant_id' => $tenant->id,
                'name'      => $validated['owner_name'],
                'email'     => $validated['email'],
                'password'  => Hash::make($validated['password']),
                'usertype'  => 1, // admin
                'status'    => 1, // active
            ]);

            // 3. Bootstrap default tenant settings
            TenantSettings::create([
                'tenant_id'       => $tenant->id,
                'business_name'   => $validated['business_name'],
                'timezone'        => 'Africa/Lagos',
                'currency_symbol' => '₦',
            ]);

            return $tenant;
        });

        // Log the new owner in
        $user = User::where('email', $validated['email'])
                    ->where('tenant_id', $tenant->id)
                    ->first();
        Auth::login($user);

        // Send verification code
        // \App\Services\EmailVerificationService::sendVerificationCode($user);

        $isLocal = config('app.env') === 'local';

        if ($isLocal) {
            // Store slug in session — all subsequent requests resolve tenant
            // without needing ?tenant= in the URL
            session(['_bino_tenant' => $tenant->slug]);

            return redirect('http://localhost:8000/' . $tenant->slug . '/home')
                ->with('onboarding', true);
        }

        // Production: redirect to path-based tenant URL
        return redirect('/' . $tenant->slug . '/home')
            ->with('onboarding', true);
    }
}
