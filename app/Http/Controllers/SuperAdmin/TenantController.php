<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    /**
     * Full tenant list with search, filter, sort.
     */
    public function index(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:100',
            'status' => 'nullable|in:trialing,active,grace,suspended,cancelled',
            'plan'   => 'nullable|integer|exists:plans,id',
        ]);

        $query = Tenant::withTrashed()
            ->with(['plan', 'settings', 'activeSubscription'])
            ->withCount('users');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan')) {
            $query->where('plan_id', $request->plan);
        }

        $tenants = $query->orderByDesc('created_at')->paginate(30)->withQueryString();
        $plans   = Plan::active()->get();

        // Summary stats for filter bar
        $stats = Tenant::selectRaw("
            SUM(status = 'active')    as active,
            SUM(status = 'trialing')  as trialing,
            SUM(status = 'grace')     as grace,
            SUM(status = 'suspended') as suspended,
            COUNT(*)                  as total
        ")->first();

        return view('superadmin.tenants.index', compact('tenants', 'plans', 'stats'));
    }

    /**
     * Tenant detail page: users, recent activity, subscription history.
     */
    public function show(int $id)
    {
        $tenant = Tenant::withTrashed()->with([
            'plan', 'settings', 'subscriptions.plan',
        ])->findOrFail($id);

        $users = User::where('tenant_id', $tenant->id)
            ->orderByDesc('created_at')
            ->get();

        $recentEvents = \App\Models\PaymentEvent::where('tenant_id', $tenant->id)
            ->latest('processed_at')
            ->limit(10)
            ->get();

        $auditLogs = AuditLog::where('tenant_id', $tenant->id)
            ->with('superAdmin')
            ->latest('created_at')
            ->limit(20)
            ->get();

        $plans = Plan::active()->get();

        return view('superadmin.tenants.show', compact(
            'tenant', 'users', 'recentEvents', 'auditLogs', 'plans'
        ));
    }

    /**
     * Suspend a tenant immediately.
     */
    public function suspend(Request $request, int $id)
    {
        $tenant = Tenant::findOrFail($id);

        if ($tenant->isSuspended()) {
            return back()->with('error', 'Tenant is already suspended.');
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        $tenant->update(['status' => 'suspended']);

        AuditLog::record(
            'tenant.suspend',
            "Suspended tenant: {$tenant->name}",
            $tenant,
            ['reason' => $request->reason ?? 'Manual suspension by super admin']
        );

        return back()->with('success', "{$tenant->name} has been suspended.");
    }

    /**
     * Unsuspend a tenant — reactivates them to 'active'.
     */
    public function unsuspend(Request $request, int $id)
    {
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status'        => 'active',
            'grace_ends_at' => null,
        ]);

        AuditLog::record(
            'tenant.unsuspend',
            "Unsuspended tenant: {$tenant->name}",
            $tenant
        );

        return back()->with('success', "{$tenant->name} has been reactivated.");
    }

    /**
     * Extend a tenant's trial by N days.
     */
    public function extendTrial(Request $request, int $id)
    {
        $request->validate(['days' => 'required|integer|min:1|max:90']);

        $tenant = Tenant::findOrFail($id);

        $oldEnds  = $tenant->trial_ends_at;
        $base     = ($tenant->trial_ends_at && $tenant->trial_ends_at->isFuture())
                    ? $tenant->trial_ends_at
                    : now();

        $newEnds = $base->addDays((int) $request->days);

        $tenant->update([
            'status'        => 'trialing',
            'trial_ends_at' => $newEnds,
        ]);

        AuditLog::record(
            'tenant.trial_extended',
            "Extended trial for {$tenant->name} by {$request->days} days (until {$newEnds->format('Y-m-d')})",
            $tenant,
            ['days_added' => $request->days, 'new_end' => $newEnds->toDateString()]
        );

        return back()->with('success', "Trial extended until {$newEnds->format('M j, Y')}.");
    }

    /**
     * Force-change a tenant's plan (for deals, refunds, support).
     * Also strips enterprise-only features when downgrading.
     */
    public function changePlan(Request $request, int $id)
    {
        $request->validate(['plan_id' => 'required|exists:plans,id']);

        $tenant  = Tenant::findOrFail($id);
        $oldPlan = $tenant->plan;
        $newPlan = Plan::findOrFail($request->plan_id);

        DB::transaction(function () use ($tenant, $newPlan, $oldPlan) {
            $tenant->update([
                'plan_id' => $newPlan->id,
                'status'  => 'active',
            ]);

            // Strip enterprise-only branding when downgrading from Enterprise
            $wasEnterprise = $oldPlan && str_starts_with($oldPlan->slug, 'enterprise');
            $isEnterprise  = str_starts_with($newPlan->slug, 'enterprise');

            if ($wasEnterprise && !$isEnterprise) {
                $settings = $tenant->settings;
                if ($settings) {
                    // Delete logo file if exists
                    if ($settings->logo_path) {
                        \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->logo_path);
                    }
                    $settings->update([
                        'logo_path'       => null,
                        'primary_color'   => '#2563eb',
                        'secondary_color' => '#1e40af',
                    ]);
                }
            }

            // Enforce user limit — deactivate excess users if downgrading
            if ($newPlan->max_users > 0) {
                $users = \App\Models\User::where('tenant_id', $tenant->id)
                    ->orderBy('usertype', 'desc') // keep admins first
                    ->orderBy('created_at')
                    ->get();

                if ($users->count() > $newPlan->max_users) {
                    $toDeactivate = $users->slice($newPlan->max_users);
                    \App\Models\User::whereIn('id', $toDeactivate->pluck('id'))
                        ->update(['status' => 0]);
                }
            }

            Subscription::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->update(['status' => 'cancelled']);

            Subscription::create([
                'tenant_id'   => $tenant->id,
                'plan_id'     => $newPlan->id,
                'status'      => 'active',
                'starts_at'   => now(),
                'amount_kobo' => $newPlan->price_kobo,
            ]);
        });

        AuditLog::record(
            'tenant.plan_changed',
            "Changed plan for {$tenant->name}: " . ($oldPlan ? $oldPlan->name : 'None') . " → {$newPlan->name}",
            $tenant,
            ['old_plan' => $oldPlan ? $oldPlan->name : null, 'new_plan' => $newPlan->name]
        );

        return back()->with('success', "Plan changed to {$newPlan->name}.");
    }

    /**
     * Save internal notes visible only to super admins.
     */
    public function saveNotes(Request $request, int $id)
    {
        $request->validate(['notes' => 'nullable|string|max:5000']);

        $tenant = Tenant::findOrFail($id);
        $tenant->update(['internal_notes' => $request->notes]);

        AuditLog::record('tenant.notes_updated', "Updated notes for {$tenant->name}", $tenant);

        if (request()->expectsJson()) return response()->json(['success'=>true,'message'=>'Notes saved.']);
        return back()->with('success', 'Notes saved.');
    }
}
