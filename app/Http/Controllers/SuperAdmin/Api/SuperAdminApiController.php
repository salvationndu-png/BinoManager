<?php

namespace App\Http\Controllers\SuperAdmin\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PaymentEvent;
use App\Models\Plan;
use App\Models\Products;
use App\Models\Sales;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * SuperAdminApiController
 *
 * JSON API endpoints consumed exclusively by the React superadmin SPA.
 * All routes are inside the 'super_admin' middleware group so only
 * authenticated super admins can hit them.
 */
class SuperAdminApiController extends Controller
{
    // ── Dashboard ─────────────────────────────────────────────────────────

    public function dashboard()
    {
        $now = now();

        $totalTenants    = Tenant::withoutTrashed()->count();
        $activeTenants   = Tenant::where('status', 'active')->count();
        $trialingTenants = Tenant::where('status', 'trialing')->where('trial_ends_at', '>', $now)->count();
        $suspendedTenants= Tenant::whereIn('status', ['suspended', 'cancelled'])->count();
        $graceTenants    = Tenant::where('status', 'grace')->where('grace_ends_at', '>', $now)->count();

        $mrrKobo       = Subscription::where('status', 'active')->sum('amount_kobo');
        $mrr           = $mrrKobo / 100;
        $lastMrrKobo   = Subscription::where('status', 'active')->where('starts_at', '<', $now->copy()->subMonth())->sum('amount_kobo');
        $lastMrr       = $lastMrrKobo / 100;
        $mrrGrowth     = $lastMrr > 0 ? round((($mrr - $lastMrr) / $lastMrr) * 100, 1) : 0;

        $churnedThisMonth = Subscription::where('status', 'cancelled')
            ->whereMonth('cancelled_at', $now->month)->whereYear('cancelled_at', $now->year)->count();
        $activeStartOfMonth = Subscription::where('status', 'active')
            ->where('starts_at', '<', $now->copy()->startOfMonth())->count();
        $churnRate = $activeStartOfMonth > 0 ? round(($churnedThisMonth / $activeStartOfMonth) * 100, 1) : 0;

        $newSignupsThisMonth = Tenant::where('created_at', '>=', $now->copy()->subDays(30))->count();

        // Revenue chart – last 12 months
        $revenueRows = collect(); // safe default
        try { $revenueRows = PaymentEvent::where('event_type', 'charge.success')
            ->where('processed_at', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->select(DB::raw("DATE_FORMAT(processed_at, '%Y-%m') as month"), DB::raw("SUM(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.data.amount'))/100) as revenue"))
            ->groupBy('month')->orderBy('month')->get()->keyBy('month');
        } catch (\Exception $e) { /* JSON_EXTRACT unsupported - keep empty */ }

        $revenueChart = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i)->format('Y-m');
            $revenueChart[] = ['month' => Carbon::createFromFormat('Y-m', $m)->format('M Y'), 'revenue' => (float) ($revenueRows[$m]->revenue ?? 0)];
        }

        // Signups chart – last 12 months
        $signupRows = collect();
        try { $signupRows = Tenant::where('created_at', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('COUNT(*) as count'))
            ->groupBy('month')->orderBy('month')->get()->keyBy('month');
        } catch (\Exception $e) {}

        $signupsChart = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i)->format('Y-m');
            $signupsChart[] = ['month' => Carbon::createFromFormat('Y-m', $m)->format('M Y'), 'count' => (int) ($signupRows[$m]->count ?? 0)];
        }

        // Plan distribution
        $planDistribution = Tenant::where('status', 'active')->with('plan')
            ->select('plan_id', DB::raw('COUNT(*) as count'))->groupBy('plan_id')->get()
            ->map(fn($r) => ['plan' => $r->plan?->name ?? 'No Plan', 'count' => (int) $r->count]);

        // Expiring trials (next 3 days)
        $expiringTrials = Tenant::where('status', 'trialing')
            ->whereBetween('trial_ends_at', [$now, $now->copy()->addDays(3)])
            ->with('settings:tenant_id,business_name,logo_path')->orderBy('trial_ends_at')->get();

        // Recent audit activity (last 10)
        try {
            $recentActivity = AuditLog::with('superAdmin:id,name', 'tenant:id,name')
                ->latest('created_at')->limit(10)->get();
        } catch (\Exception $e) {
            $recentActivity = collect();
        }

        return response()->json([
            'totalTenants'       => $totalTenants,
            'activeTenants'      => $activeTenants,
            'trialingTenants'    => $trialingTenants,
            'suspendedTenants'   => $suspendedTenants,
            'graceTenants'       => $graceTenants,
            'mrr'                => $mrr,
            'mrrGrowth'          => $mrrGrowth,
            'churnRate'          => $churnRate,
            'churnedThisMonth'   => $churnedThisMonth,
            'newSignupsThisMonth'=> $newSignupsThisMonth,
            'revenueChart'       => $revenueChart,
            'signupsChart'       => $signupsChart,
            'planDistribution'   => $planDistribution,
            'expiringTrials'     => $expiringTrials,
            'recentActivity'     => $recentActivity,
        ]);
    }

    // ── Tenants List ──────────────────────────────────────────────────────

    public function tenants(Request $request)
    {
        $request->validate(['search'=>'nullable|string|max:100','status'=>'nullable|string','plan'=>'nullable|integer','page'=>'nullable|integer|min:1']);

        $q = Tenant::withTrashed()->with(['plan:id,name,price_kobo', 'settings:tenant_id,business_name,logo_path'])
            ->withCount('users');

        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(fn($sub) => $sub->where('name','like',"%$s%")->orWhere('email','like',"%$s%")->orWhere('slug','like',"%$s%"));
        }
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('plan'))   $q->where('plan_id', $request->plan);

        $tenants = $q->orderByDesc('created_at')->paginate(30)->withQueryString();
        $plans   = Plan::active()->get(['id','name']);
        $stats   = Tenant::selectRaw("SUM(status='active') as active, SUM(status='trialing') as trialing, SUM(status='grace') as grace, SUM(status='suspended') as suspended, COUNT(*) as total")->first();

        return response()->json([
            'data'    => $tenants->items(),
            'meta'    => ['current_page'=>$tenants->currentPage(),'last_page'=>$tenants->lastPage(),'per_page'=>$tenants->perPage(),'total'=>$tenants->total(),'from'=>$tenants->firstItem(),'to'=>$tenants->lastItem()],
            'plans'   => $plans,
            'stats'   => $stats,
        ]);
    }

    public function tenantExport(Request $request)
    {
        $q = Tenant::withTrashed()->with(['plan', 'settings']);
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(fn($sub) => $sub->where('name','like',"%$s%")->orWhere('email','like',"%$s%"));
        }
        $tenants = $q->orderByDesc('created_at')->get();

        $rows = $tenants->map(fn($t) => [
            $t->settings?->business_name ?? $t->name,
            $t->email,
            $t->plan?->name ?? 'None',
            $t->status,
            $t->created_at->format('Y-m-d'),
        ]);

        $csv = "Name,Email,Plan,Status,Joined\n" . $rows->map(fn($r) => implode(',', array_map(fn($v) => '"'.str_replace('"','""',$v).'"', $r)))->implode("\n");

        return response($csv, 200, ['Content-Type'=>'text/csv', 'Content-Disposition'=>'attachment; filename="tenants.csv"']);
    }

    // ── Tenant Detail ─────────────────────────────────────────────────────

    public function tenantDetail(int $id)
    {
        $tenant = Tenant::withTrashed()->with(['plan', 'settings', 'subscriptions.plan'])->findOrFail($id);
        $users  = User::where('tenant_id', $id)->orderBy('name')->get(['id','name','email','usertype','status','created_at']);

        $auditLog = AuditLog::with('superAdmin:id,name')
            ->where('tenant_id', $id)->latest('created_at')->limit(20)->get();

        $billingHistory = PaymentEvent::where('tenant_id', $id)
            ->where('event_type', 'charge.success')
            ->latest('processed_at')->limit(24)
            ->get(['id','payload','processed_at'])
            ->map(function($p) {
                $amount = 0;
                if (isset($p->payload['data']['amount'])) {
                    $amount = $p->payload['data']['amount'] / 100;
                }
                return [
                    'id' => $p->id,
                    'amount' => $amount,
                    'processed_at' => $p->processed_at?->toISOString(),
                    'paystack_reference' => data_get($p->payload, 'data.reference', '—'),
                ];
            })
            ->values(); // Reset array keys

        // Calculate total revenue from payment events
        $totalRevenue = PaymentEvent::where('tenant_id', $id)
            ->where('event_type','charge.success')
            ->get()
            ->sum(function($p) {
                return isset($p->payload['data']['amount']) ? $p->payload['data']['amount'] / 100 : 0;
            });

        $kpis = [
            'totalRevenue'   => round($totalRevenue, 2),
            'activeUsers'    => User::where('tenant_id', $id)->where('status', 1)->count(),
            'productsCount'  => Products::where('tenant_id', $id)->count(),
            'salesThisMonth' => round(Sales::where('tenant_id', $id)
                ->whereMonth('sale_date', now()->month)
                ->whereYear('sale_date', now()->year)
                ->sum('total'), 2),
        ];

        return response()->json([
            'tenant' => $tenant,
            'users' => $users,
            'auditLog' => $auditLog,
            'billingHistory' => $billingHistory,
            'kpis' => $kpis,
        ]);
    }

    // ── Plans ─────────────────────────────────────────────────────────────

    public function plans()
    {
        $plans = Plan::withCount(['tenants as subscribers_count' => fn($q) => $q->where('status','active')])->orderBy('sort_order')->get();
        return response()->json(['plans' => $plans]);
    }

    public function storePlan(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:100',
            'slug'         => 'required|string|max:100|unique:plans,slug',
            'billing_cycle'=> 'required|in:monthly,annual',
            'price_kobo'   => 'required|integer|min:100000',
            'max_users'    => 'required|integer|min:0',
            'max_products' => 'required|integer|min:0',
            'features'     => 'array',
            'is_active'    => 'boolean',
            'is_popular'   => 'boolean',
            'sort_order'   => 'integer|min:0',
        ]);
        $plan = Plan::create($data);
        AuditLog::record('plan.create', "Created plan: {$plan->name} ({$plan->billing_cycle})", null, ['plan_id'=>$plan->id]);
        return response()->json(['success'=>true,'plan'=>$plan]);
    }

    public function updatePlan(Request $request, int $id)
    {
        $plan = Plan::findOrFail($id);
        $data = $request->validate([
            'name'         => 'required|string|max:100',
            'billing_cycle'=> 'required|in:monthly,annual',
            'price_kobo'   => 'required|integer|min:100000',
            'max_users'    => 'required|integer|min:0',
            'max_products' => 'required|integer|min:0',
            'features'     => 'array',
            'is_active'    => 'boolean',
            'is_popular'   => 'boolean',
            'sort_order'   => 'integer|min:0',
        ]);
        $plan->update($data);
        AuditLog::record('plan.update', "Updated plan: {$plan->name} ({$plan->billing_cycle})", null, ['plan_id'=>$plan->id]);
        return response()->json(['success'=>true,'plan'=>$plan]);
    }

    public function togglePlan(int $id)
    {
        $plan = Plan::findOrFail($id);
        $plan->update(['is_active' => !$plan->is_active]);
        AuditLog::record('plan.toggle', ($plan->is_active ? 'Activated' : 'Deactivated')." plan: {$plan->name}", null, ['plan_id'=>$plan->id]);
        return response()->json(['success'=>true,'is_active'=>$plan->is_active]);
    }

    // ── Gateways ──────────────────────────────────────────────────────────

    public function gateways()
    {
        $gateways = \App\Models\PaymentGateway::orderBy('name')->get()->map(fn($g) => [
            'id'               => $g->id,
            'name'             => $g->name,
            'slug'             => $g->slug,
            'is_active'        => $g->is_active,
            'currency'         => $g->currency,
            'has_keys'         => $g->hasKeys(),
            'masked_public_key'=> $g->getMaskedPublicKey(),
            'masked_secret_key'=> $g->getMaskedSecretKey(),
            'config'           => $g->config,
        ]);
        return response()->json(['gateways' => $gateways]);
    }

    public function payments()
    {
        $transactions = PaymentEvent::with('tenant:id,name', 'subscription.plan:id,name')
            ->where('event_type', 'charge.success')
            ->latest('processed_at')->limit(50)
            ->get()
            ->map(fn($p) => [
                'id'                  => $p->id,
                'processed_at'        => $p->processed_at,
                'tenant'              => $p->tenant ? ['name' => $p->tenant->name] : null,
                'plan'                => $p->subscription?->plan ? ['name' => $p->subscription->plan->name] : null,
                'amount'              => ($p->payload['data']['amount'] ?? 0) / 100,
                'paystack_reference'  => data_get($p->payload, 'data.reference'),
            ]);

        return response()->json(['transactions' => $transactions]);
    }

    public function pingGateway()
    {
        $gateway = \App\Models\PaymentGateway::active();
        if (!$gateway || !$gateway->hasKeys()) {
            return response()->json(['success'=>false,'message'=>'No active gateway with keys configured'], 400);
        }
        $start = microtime(true);
        try {
            $response = \Illuminate\Support\Facades\Http::withToken($gateway->secret_key)
                ->timeout(5)->get('https://api.paystack.co/balance');
            $latency  = round((microtime(true) - $start) * 1000);
            return response()->json(['success'=>$response->successful(),'latency'=>$latency,'message'=>$response->successful()?'Connected':'Paystack returned '.$response->status()]);
        } catch (\Exception $e) {
            return response()->json(['success'=>false,'message'=>'Connection failed: '.$e->getMessage()], 503);
        }
    }

    // ── Audit Log ─────────────────────────────────────────────────────────

    public function auditLog(Request $request)
    {
        $request->validate(['search'=>'nullable|string|max:200','action'=>'nullable|string|max:100','page'=>'nullable|integer|min:1','self'=>'nullable|boolean']);

        $q = AuditLog::with('superAdmin:id,name', 'tenant:id,name')->latest('created_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $q->where(fn($sub) => $sub->where('description','like',"%$s%")->orWhereHas('tenant', fn($t) => $t->where('name','like',"%$s%")));
        }
        if ($request->filled('action')) $q->where('action', $request->action);
        if ($request->boolean('self'))  $q->where('super_admin_id', auth('super_admin')->id());

        $perPage = $request->integer('per_page', 50);
        $results = $q->paginate($perPage)->withQueryString();
        $actions = AuditLog::distinct()->orderBy('action')->pluck('action');

        return response()->json([
            'data'    => $results->items(),
            'meta'    => ['current_page'=>$results->currentPage(),'last_page'=>$results->lastPage(),'total'=>$results->total(),'from'=>$results->firstItem(),'to'=>$results->lastItem()],
            'actions' => $actions,
        ]);
    }

    public function auditExport(Request $request)
    {
        $q = AuditLog::with('superAdmin:id,name','tenant:id,name')->latest('created_at');
        if ($request->filled('action')) $q->where('action', $request->action);
        $rows = $q->limit(5000)->get();

        $csv = "Date,Action,Description,Super Admin,Tenant,IP\n" . $rows->map(fn($r) =>
            '"'.implode('","', [
                $r->created_at->format('Y-m-d H:i:s'),
                $r->action,
                str_replace('"','""',$r->description),
                $r->superAdmin?->name ?? '',
                $r->tenant?->name ?? '',
                $r->ip_address ?? '',
            ]).'"'
        )->implode("\n");

        return response($csv, 200, ['Content-Type'=>'text/csv', 'Content-Disposition'=>'attachment; filename="audit-log.csv"']);
    }

    // ── Settings ──────────────────────────────────────────────────────────

    public function getSettings()
    {
        $keys = ['trial_days','grace_days','support_email','trial_reminder_7d','trial_reminder_3d','trial_reminder_1d','grace_reminder','auto_suspend','platform_name','landing_headline','tos_url','privacy_url','session_lifetime','login_throttle','reserved_slugs','maintenance_mode'];
        $settings = [];
        foreach ($keys as $key) {
            $val = config("platform.{$key}") ?? \Illuminate\Support\Facades\Cache::get("platform_setting:{$key}");
            $settings[$key] = $val;
        }
        return response()->json(['settings' => $settings]);
    }

    public function saveSettings(Request $request, string $section)
    {
        $allowed = ['billing','branding','limits'];
        if (!in_array($section, $allowed)) abort(404);

        foreach ($request->except('_token') as $key => $value) {
            \Illuminate\Support\Facades\Cache::forever("platform_setting:{$key}", $value);
        }
        AuditLog::record("settings.{$section}", "Updated {$section} settings");
        return response()->json(['success'=>true]);
    }

    public function clearCache()
    {
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');
        AuditLog::record('settings.clear-cache', 'Cleared all application caches');
        return response()->json(['success'=>true,'message'=>'All caches cleared']);
    }

    public function toggleMaintenance()
    {
        $current = \Illuminate\Support\Facades\Cache::get('platform_setting:maintenance_mode', false);
        \Illuminate\Support\Facades\Cache::forever('platform_setting:maintenance_mode', !$current);
        $action = $current ? 'disabled' : 'enabled';
        AuditLog::record('settings.maintenance', "Maintenance mode {$action}");
        return response()->json(['success'=>true,'maintenance_mode'=>!$current]);
    }

    // ── Profile ───────────────────────────────────────────────────────────

    public function getProfile()
    {
        return response()->json(['admin' => auth('super_admin')->user()]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:12|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $admin = auth('super_admin')->user();
        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $admin->password)) {
            return response()->json(['message'=>'Current password is incorrect','errors'=>['current_password'=>['Current password is incorrect']]], 422);
        }

        $admin->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);
        AuditLog::record('admin.password_change', 'Super admin changed their password');
        return response()->json(['success'=>true,'message'=>'Password updated successfully']);
    }

    // ── Diagnostic: raw counts for debugging ──────────────────────────────
    public function diagnostic()
    {
        return response()->json([
            'tenant_count_raw'        => \DB::table('tenants')->count(),
            'tenant_count_eloquent'   => \App\Models\Tenant::count(),
            'tenant_count_no_trash'   => \App\Models\Tenant::withoutTrashed()->count(),
            'tenant_statuses'         => \DB::table('tenants')->select('status', \DB::raw('count(*) as cnt'))->groupBy('status')->get(),
            'current_tenant_bound'    => app()->bound('current.tenant.id'),
            'current_tenant_id'       => app()->bound('current.tenant.id') ? app('current.tenant.id') : null,
            'auth_guard'              => auth('super_admin')->check() ? 'authenticated' : 'unauthenticated',
            'admin_id'                => auth('super_admin')->id(),
        ]);
    }
}
