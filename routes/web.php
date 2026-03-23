<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\TenantRegistrationController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\PaystackWebhookController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\SubscriptionUpgradeController;


// ── Central domain (landing, signup, webhook) ──────────────────────────────

Route::middleware(['initialize.tenancy'])->group(function () {
    // Route::get('/', function () {
    //     // Clear tenant session if explicitly visiting root without ?tenant=
    //     if (!request()->has('tenant') && session()->has('_bino_tenant')) {
    //         session()->forget('_bino_tenant');
    //     }
        
    //     if (app()->bound('current.tenant') && app('current.tenant')) return redirect('/home');
    //     return view('landing-react');
    // })->name('home.landing');
    Route::get('/', function () {
    if (auth()->check() && auth()->user()?->tenant_id) {
        $tenant = \App\Models\Tenant::find(auth()->user()->tenant_id);
        if ($tenant && !$tenant->trashed()) {
            return redirect('/' . $tenant->slug . '/home');
        }
    }
    return view('landing-react');
})->name('home.landing');

    Route::get('/register-workspace',  [TenantRegistrationController::class, 'create'])->name('tenant.register');
    Route::post('/register-workspace', [TenantRegistrationController::class, 'store'])->name('tenant.register.store')
        ->middleware('throttle:5,1');

    // Pricing page
    Route::get('/pricing', [PricingController::class, 'index'])->name('pricing');
    Route::post('/pricing/initialize-payment', [PricingController::class, 'initializePayment'])
        ->middleware('throttle:10,1');

    // Subscription upgrade routes
    Route::middleware(['auth', 'initialize.tenancy'])->group(function () {
        Route::get('/subscription/upgrade', [SubscriptionUpgradeController::class, 'showUpgradePage'])->name('subscription.upgrade');
        Route::get('/subscription/upgrade/calculate', [SubscriptionUpgradeController::class, 'calculateUpgrade']);
        Route::post('/subscription/upgrade/process', [SubscriptionUpgradeController::class, 'processUpgrade']);
    });

    // Public plans API — used by landing page pricing section
    Route::get('/api/public/plans', function () {
        return response()->json(
            \App\Models\Plan::active()->get()->map(function($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'billing_cycle' => $plan->billing_cycle,
                    'price_kobo' => $plan->price_kobo,
                    'price_naira' => $plan->price_naira,
                    'monthly_equivalent' => $plan->monthly_equivalent,
                    'annual_savings' => $plan->annual_savings,
                    'max_users' => $plan->max_users,
                    'max_products' => $plan->max_products,
                    'features' => $plan->features,
                    'is_active' => $plan->is_active,
                    'is_popular' => $plan->is_popular,
                ];
            })
        );
    })->name('public.plans');
    
    // Diagnostic endpoint
    Route::get('/api/diagnostic/plan', [\App\Http\Controllers\DiagnosticController::class, 'planInfo'])
        ->middleware('auth');

    Route::get('/invitation/{token}',  [TeamController::class, 'showAcceptForm'])->name('invitation.show');
    Route::post('/invitation/{token}', [TeamController::class, 'acceptInvitation'])->name('invitation.accept')
        ->middleware('throttle:10,1');

    Route::get('/reset-password/{id}/{token}',  [AdminController::class, 'showResetForm'])->name('admin.password.reset');
    Route::post('/reset-password/{id}/{token}', [AdminController::class, 'processReset'])->name('admin.password.update');
});

Route::post('/webhooks/paystack', [PaystackWebhookController::class, 'handle'])
    ->name('webhooks.paystack');

// ── SuperAdmin routes (registered BEFORE tenant slug routes to prevent route hijacking) ──
Route::prefix('superadmin')->name('superadmin.')->group(function () {
    Route::get('/login',  [\App\Http\Controllers\SuperAdmin\AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [\App\Http\Controllers\SuperAdmin\AuthController::class, 'login'])->name('login.submit')->middleware('throttle:10,1');
    Route::post('/logout', [\App\Http\Controllers\SuperAdmin\AuthController::class, 'logout'])->name('logout');

    Route::middleware('super_admin')->group(function () {
        // Root → React SPA (direct, no redirect to avoid session loss)
        Route::get('/', [\App\Http\Controllers\SuperAdmin\SuperAdminShellController::class, 'show'])->name('dashboard');
        // Original Blade dashboard kept for reference at /superadmin/blade
        Route::get('/blade', [\App\Http\Controllers\SuperAdmin\DashboardController::class, 'index'])->name('blade.dashboard');
        // /superadmin/app also serves the React SPA
        Route::get('/app', [\App\Http\Controllers\SuperAdmin\SuperAdminShellController::class, 'show'])->name('react.app');
        
        // Payment Gateways
        Route::get('/payments', [\App\Http\Controllers\SuperAdmin\PaymentController::class, 'index'])->name('payments.index');
        Route::put('/payments/{id}', [\App\Http\Controllers\SuperAdmin\PaymentController::class, 'update'])->name('payments.update');
        Route::patch('/payments/{id}/toggle', [\App\Http\Controllers\SuperAdmin\PaymentController::class, 'toggleActive'])->name('payments.toggle');
        
        Route::prefix('tenants')->name('tenants.')->group(function () {
            Route::get('/',                  [\App\Http\Controllers\SuperAdmin\TenantController::class, 'index'])->name('index');
            Route::get('/{id}',              [\App\Http\Controllers\SuperAdmin\TenantController::class, 'show'])->name('show');
            Route::post('/{id}/suspend',     [\App\Http\Controllers\SuperAdmin\TenantController::class, 'suspend'])->name('suspend');
            Route::post('/{id}/unsuspend',   [\App\Http\Controllers\SuperAdmin\TenantController::class, 'unsuspend'])->name('unsuspend');
            Route::post('/{id}/extend-trial',[\App\Http\Controllers\SuperAdmin\TenantController::class, 'extendTrial'])->name('extendTrial');
            Route::post('/{id}/change-plan', [\App\Http\Controllers\SuperAdmin\TenantController::class, 'changePlan'])->name('changePlan');
            Route::post('/{id}/notes',       [\App\Http\Controllers\SuperAdmin\TenantController::class, 'saveNotes'])->name('saveNotes');
        });


        // ── Email Settings ─────────────────────────────────────────────────────
        Route::prefix('email-settings')->name('email.')->group(function () {
            Route::get('/', [\App\Http\Controllers\SuperAdmin\EmailSettingsController::class, 'index'])->name('index');
            Route::post('/', [\App\Http\Controllers\SuperAdmin\EmailSettingsController::class, 'update'])->name('update');
            Route::post('/test', [\App\Http\Controllers\SuperAdmin\EmailSettingsController::class, 'test'])->name('test')->middleware('throttle:5,1');
            Route::patch('/toggle', [\App\Http\Controllers\SuperAdmin\EmailSettingsController::class, 'toggleActive'])->name('toggle');
        });

        // ── JSON API routes (consumed by the React SPA) ────────────────────────
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/dashboard',           [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'dashboard'])->name('dashboard');
            Route::get('/tenants',             [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'tenants'])->name('tenants');
            Route::get('/tenants/export',      [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'tenantExport'])->name('tenants.export');
            Route::get('/tenants/{id}',        [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'tenantDetail'])->name('tenants.detail');
            Route::get('/plans',               [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'plans'])->name('plans');
            Route::post('/plans',              [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'storePlan'])->name('plans.store');
            Route::patch('/plans/{id}',        [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'updatePlan'])->name('plans.update');
            Route::patch('/plans/{id}/toggle', [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'togglePlan'])->name('plans.toggle');
            Route::get('/gateways',            [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'gateways'])->name('gateways');
            Route::get('/payments',            [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'payments'])->name('payments');
            Route::post('/gateway-ping',       [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'pingGateway'])->name('gateway.ping');
            Route::get('/feedback',            [\App\Http\Controllers\FeedbackController::class, 'adminIndex'])->name('feedback');
            Route::patch('/feedback/{ticket}',  [\App\Http\Controllers\FeedbackController::class, 'adminReply'])->name('feedback.reply');
            Route::get('/audit',               [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'auditLog'])->name('audit');
            Route::get('/audit/export',        [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'auditExport'])->name('audit.export');
            Route::get('/settings',            [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'getSettings'])->name('settings');
            Route::post('/settings/clear-cache',        [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'clearCache'])->name('settings.clear-cache');
            Route::post('/settings/toggle-maintenance', [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'toggleMaintenance'])->name('settings.maintenance');
            Route::post('/settings/{section}',          [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'saveSettings'])->name('settings.save');
            Route::get('/profile',                     [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'getProfile'])->name('profile');
            Route::post('/profile/change-password',    [\App\Http\Controllers\SuperAdmin\Api\SuperAdminApiController::class, 'changePassword'])->name('profile.password');
        });

        Route::post('/impersonate/{tenantId}/start', [\App\Http\Controllers\SuperAdmin\ImpersonateController::class, 'start'])->name('impersonate.start');
    });
});

Route::post('/impersonate/stop', [\App\Http\Controllers\SuperAdmin\ImpersonateController::class, 'stop'])
    ->name('impersonate.stop')->middleware('auth');

// ── END SuperAdmin routes ──────────────────────────────────────────────────────────────

// ── Tenant authenticated routes ────────────────────────────────────────────

Route::prefix('{tenant_slug}')->middleware(['initialize.tenancy', 'auth', 'check.status', 'tenant.subscription'])->group(function () {

    // ── React SPA shell ────────────────────────────────────────────────────
    // /home serves the React SPA. All navigation happens client-side inside
    // the SPA. The Blade shell seeds window.BinoManager and loads the Vite
    // bundle. No other dashboard routes need to change — the SPA fetches data
    // from the existing API routes below.
    // React SPA shell — serves tenant-app.blade.php which seeds window.BinoManager
    Route::get('/home', [\App\Http\Controllers\TenantAppController::class, 'show'])->name('home');
    Route::get('/app',  [\App\Http\Controllers\TenantAppController::class, 'show'])->name('tenant.app');

    // ── Dashboard JSON API (consumed by React Dashboard component) ─────────
    Route::get('/api/dashboard', [\App\Http\Controllers\Api\DashboardApiController::class, 'index']);

    // ── Billing (accessible even when suspended) ───────────────────────────
    Route::get('/billing',           [BillingController::class, 'index'])->name('billing');
    Route::post('/billing/checkout', [BillingController::class, 'checkout'])->name('billing.checkout')
        ->middleware('throttle:10,1');
    Route::get('/billing/verify',    [BillingController::class, 'verify'])->name('billing.verify');

    // ── Jetstream profile ──────────────────────────────────────────────────
    Route::get('/user/profile', [\Laravel\Jetstream\Http\Controllers\Livewire\UserProfileController::class, 'show'])
        ->name('tenant.profile.show');

    // ── Profile API (consumed by React Profile component) ─────────────────
    Route::put('/api/profile', [\App\Http\Controllers\Api\ProfileController::class, 'updateProfile']);
    Route::put('/api/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);
    Route::get('/api/profile/sessions', [\App\Http\Controllers\Api\ProfileController::class, 'getSessions']);
    Route::delete('/api/profile/sessions', [\App\Http\Controllers\Api\ProfileController::class, 'logoutOtherSessions']);
    
    // Two-Factor Authentication
    Route::get('/api/profile/two-factor', [\App\Http\Controllers\Api\ProfileController::class, 'getTwoFactorStatus']);
    Route::post('/api/profile/two-factor', [\App\Http\Controllers\Api\ProfileController::class, 'enableTwoFactor']);
    Route::post('/api/profile/two-factor/confirm', [\App\Http\Controllers\Api\ProfileController::class, 'confirmTwoFactor']);
    Route::delete('/api/profile/two-factor', [\App\Http\Controllers\Api\ProfileController::class, 'disableTwoFactor']);
    Route::get('/api/profile/two-factor/recovery-codes', [\App\Http\Controllers\Api\ProfileController::class, 'getRecoveryCodes']);
    Route::post('/api/profile/two-factor/recovery-codes', [\App\Http\Controllers\Api\ProfileController::class, 'regenerateRecoveryCodes']);

    // Email Change
    Route::post('/api/profile/email/request', [\App\Http\Controllers\Api\ProfileController::class, 'requestEmailChange'])->middleware('throttle:5,10');
    Route::post('/api/profile/email/confirm', [\App\Http\Controllers\Api\ProfileController::class, 'confirmEmailChange'])->middleware('throttle:5,10');
    Route::post('/api/profile/email/cancel', [\App\Http\Controllers\Api\ProfileController::class, 'cancelEmailChange']);

    // ── Email Verification ─────────────────────────────────────────────────
    Route::get('/api/email-verification/status', [\App\Http\Controllers\Api\EmailVerificationController::class, 'status']);
    Route::post('/api/email-verification/send', [\App\Http\Controllers\Api\EmailVerificationController::class, 'send'])->middleware('throttle:5,10');
    Route::post('/api/email-verification/verify', [\App\Http\Controllers\Api\EmailVerificationController::class, 'verify'])->middleware('throttle:5,10');
    Route::post('/api/email-verification/resend', [\App\Http\Controllers\Api\EmailVerificationController::class, 'resend'])->middleware('throttle:5,10');

    // ── Analytics API (consumed by React Analytics component) ─────────────
    Route::get('/analytics/profit-loss',         [AnalyticsController::class, 'getProfitLoss']);
    Route::get('/analytics/inventory-valuation',  [AnalyticsController::class, 'getInventoryValuation']);
    // /api/dashboard is registered above at line 100 via DashboardApiController

    // ── Financial Statements ───────────────────────────────────────────────
    Route::get('/api/financials', [\App\Http\Controllers\FinancialController::class, 'index']);

    // ── Sales ──────────────────────────────────────────────────────────────
    Route::post('/add-sale',            [SaleController::class, 'addSale'])->middleware('throttle:sales');
    Route::get('/track-sales-data',     [SaleController::class, 'getTrackSalesData'])->name('track.sales.data');

    // ── Products / Stock (consumed by React Products + Stock components) ───
    Route::get('/products-list',             [ProductController::class, 'getProducts']);
    Route::get('/inventory-products',         [ProductController::class, 'getAllProducts']);
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'getByBarcode']);
    Route::get('/stock-list',                [StockController::class, 'getStockList']);
    Route::get('/get-product-details/{id}',  [ProductController::class, 'getProductDetails']);
    Route::get('/get-product-quantity/{id}', [ProductController::class, 'getQuantity']);

    // ── Customers for sales dropdown ───────────────────────────────────────
    Route::get('/customers-for-sales', [CustomerController::class, 'getCustomersForSales']);

    // ── Admin-only ─────────────────────────────────────────────────────────
    Route::middleware(['restrict.normal', 'admin'])->group(function () {

        // Products
        Route::post('/add-product',           [ProductController::class, 'addProduct'])->name('add.product');
        Route::put('/update-product/{id}',     [ProductController::class, 'updateProduct']);
        Route::delete('/delete-product/{id}', [ProductController::class, 'deleteProduct']);

        // Stock
        Route::get('/stock',                  [HomeController::class, 'stock']); // Blade stock page (iframe)
        Route::post('/add-stock',             [StockController::class, 'addStock']);
        Route::delete('/delete-stock/{id}',   [StockController::class, 'deleteStock']);
        Route::patch('/update-stock/{id}',    [StockController::class, 'updateStock']);
        Route::patch('/update-price/{id}',    [StockController::class, 'updatePrice']);

        // Sales track page (Blade, used in iframe for Reports page)
        Route::get('/track',     [HomeController::class, 'track']);
        Route::get('/analytics', [HomeController::class, 'analytics']); // Blade analytics (kept for compatibility)

        // Customers CRUD
        Route::get('/customers',              [CustomerController::class, 'index']);
        Route::get('/customers/list',         [CustomerController::class, 'getCustomers']);
        Route::post('/customers',             [CustomerController::class, 'store']);
        Route::get('/customers/{id}',         [CustomerController::class, 'show']);
        Route::put('/customers/{id}',         [CustomerController::class, 'update']);
        Route::delete('/customers/{id}',      [CustomerController::class, 'destroy']);
        Route::post('/customers/{id}/payments', [CustomerController::class, 'recordPayment']);
        Route::get('/customers/{id}/payments',  [CustomerController::class, 'getPayments']);

        // Users management (API only - UI is in Team component)
        Route::get('/admin/users/list',                 [AdminController::class, 'getUsers']);
        Route::get('/admin/users/stats',                [AdminController::class, 'getUserStats']);
        Route::post('/admin/users/create',              [AdminController::class, 'createUser']);
        Route::put('/admin/users/{id}',                 [AdminController::class, 'updateUser']);
        Route::patch('/admin/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::post('/admin/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
        Route::delete('/admin/users/{id}',              [AdminController::class, 'deleteUser']);

        // Team
        // JSON endpoints for React Team component
        Route::get('/api/team', function () {
            $tenant      = app('current.tenant');
            $members     = \App\Models\User::where('tenant_id', $tenant->id)->orderBy('name')
                            ->get(['id','name','email','usertype','status','created_at']);
            $invitations = \App\Models\TeamInvitation::where('tenant_id', $tenant->id)
                            ->whereNull('accepted_at')->where('expires_at', '>', now())
                            ->with('inviter:id,name')->get();
            return response()->json(['members' => $members, 'invitations' => $invitations]);
        });
        Route::get('/api/team-usage', function () {
            $tenant = app('current.tenant');
            return response()->json((new \App\Services\PlanEnforcementService($tenant))->usageStats());
        });

        Route::get('/team',                     [TeamController::class, 'index'])->name('team.index');
        Route::post('/team/invite',             [TeamController::class, 'invite'])->name('team.invite')
            ->middleware('throttle:20,1');
        Route::delete('/team/invitations/{id}', [TeamController::class, 'revoke'])->name('team.revoke');
        Route::delete('/team/members/{id}',     [TeamController::class, 'removeMember'])->name('team.remove');

        // Settings
        Route::get('/settings',              [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings');
        Route::post('/settings/branding',    [\App\Http\Controllers\SettingsController::class, 'updateBranding'])->name('settings.branding');
        Route::post('/settings/preferences', [\App\Http\Controllers\SettingsController::class, 'updatePreferences'])->name('settings.preferences');
    });

    // ── Feedback & Support ──────────────────────────────────────────────────
    Route::get('/api/feedback',  [\App\Http\Controllers\FeedbackController::class, 'index']);
    Route::post('/api/feedback', [\App\Http\Controllers\FeedbackController::class, 'store'])->middleware('throttle:10,1');

    // Sales page still available as Blade (fallback / for reports iframe)
    Route::get('/sales', [HomeController::class, 'sales']);
    Route::get('/product', [HomeController::class, 'product']);
});

// ═══════════════════════════════════════════════════════════════════════════
// SUPER ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Sanctum dashboard (kept for compatibility)
Route::middleware(['auth:sanctum', config('jetstream.auth_session'), 'verified'])->group(function () {
    Route::get('/dashboard', function () { return view('dashboard'); })->name('dashboard');
});

// ── Legacy URL redirects ──────────────────────────────────────────────────
// These catch old bookmarks and forward them to /home (React SPA shell).
// Must run OUTSIDE the auth group so unauthenticated users get redirected
// to login via Fortify's normal flow before hitting the SPA.
Route::middleware(['initialize.tenancy'])->group(function () {
    foreach (['/sales', '/track', '/analytics', '/product',
              '/stock', '/customers', '/admin/users', '/team',
              '/settings'] as $legacy) {
        Route::get($legacy, function () use ($legacy) {
            $qs = request()->has('tenant') ? '?tenant=' . request()->get('tenant') : '';
            return redirect('/home' . $qs);
        });
    }
});
