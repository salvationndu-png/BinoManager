<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\TenantSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    use RequiresTenant;
    public function index()
    {
        $tenant   = $this->tenant();
        $settings = TenantSettings::firstOrCreate(
            ['tenant_id' => $tenant->id],
            ['business_name' => $tenant->name, 'timezone' => 'Africa/Lagos', 'currency_symbol' => '₦']
        );

        return view('tenant.settings', compact('tenant', 'settings'));
    }

    /**
     * Update branding: business name, logo, address, receipt footer.
     *
     * Security:
     * - Logo upload validated: image only, max 2MB, stored in tenant-private directory
     * - Old logo deleted when replaced
     * - tenant_id always from server context, never from form
     */
    public function updateBranding(Request $request)
    {
        $tenant = $this->tenant();
        $plan = $tenant->plan;

        $validated = $request->validate([
            'business_name'  => 'required|string|max:100',
            'address'        => 'nullable|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'receipt_footer' => 'nullable|string|max:200',
            'primary_color'  => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'secondary_color'=> 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'logo'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Enforce custom branding for Enterprise plan only
        $hasCustomBranding = $plan && str_starts_with($plan->slug, 'enterprise');
        
        if (!$hasCustomBranding && ($request->filled('primary_color') || $request->filled('secondary_color') || $request->hasFile('logo'))) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Custom branding (logo & colors) is only available on the Enterprise plan. Upgrade to customize your brand.',
                    'upgrade_url' => url('/billing')
                ], 402);
            }
            return back()->with('error', 'Custom branding is only available on the Enterprise plan.');
        }

        $settings = TenantSettings::firstOrCreate(['tenant_id' => $tenant->id]);

        if ($request->hasFile('logo') && $hasCustomBranding) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            $path = $request->file('logo')->store("tenants/{$tenant->id}/logo", 'public');
            $settings->logo_path = $path;
        }

        $settings->fill([
            'business_name'  => InputSanitizer::sanitize($validated['business_name']),
            'address'        => InputSanitizer::sanitize($validated['address'] ?? null),
            'phone'          => InputSanitizer::sanitize($validated['phone'] ?? null),
            'receipt_footer' => InputSanitizer::sanitize($validated['receipt_footer'] ?? null),
            'primary_color'  => $hasCustomBranding ? ($validated['primary_color'] ?? '#2563eb') : '#2563eb',
            'secondary_color'=> $hasCustomBranding ? ($validated['secondary_color'] ?? '#1e40af') : '#1e40af',
        ])->save();

        $tenant->update(['name' => InputSanitizer::sanitize($validated['business_name'])]);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Branding updated successfully.']);
        }
        return back()->with('success', 'Branding updated successfully.');
    }

    /**
     * Update preferences: timezone, currency, notification toggles.
     */
    public function updatePreferences(Request $request)
    {
        $tenant = $this->tenant();

        $validated = $request->validate([
            'timezone'               => 'required|timezone',
            'currency_symbol'        => 'required|string|max:5',
            'low_stock_threshold'    => 'required|integer|min:1|max:9999',
            'notify_low_stock'       => 'boolean',
            'notify_daily_summary'   => 'boolean',
            'notify_credit_reminder' => 'boolean',
        ]);

        TenantSettings::updateOrCreate(
            ['tenant_id' => $tenant->id],
            $validated
        );

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'message' => 'Preferences updated.']);
        }
        return back()->with('success', 'Preferences updated.');
    }
}
