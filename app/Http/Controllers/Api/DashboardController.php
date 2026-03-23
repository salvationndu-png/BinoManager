<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\Products;
use App\Models\Stocks;
use App\Models\Sales;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use DB;

class DashboardController extends Controller
{
    use RequiresTenant;

    /**
     * Single endpoint that returns everything the React dashboard needs.
     * All queries are tenant-scoped via BelongsToTenant global scope.
     * All cache keys include the tenant ID — no cross-tenant leakage.
     */
    public function index()
    {
        $tid = app('current.tenant.id');
        $cp  = "tenant.{$tid}.dashboard";

        // ── Real-time (no cache) ───────────────────────────────────────────
        $todaysSales    = Sales::whereDate('sale_date', Carbon::today())->sum('total');
        $yesterdaySales = Sales::whereDate('sale_date', Carbon::yesterday())->sum('total');
        $salesChange    = $yesterdaySales > 0
            ? (($todaysSales - $yesterdaySales) / $yesterdaySales) * 100 : 0;

        $monthSales     = Sales::whereMonth('sale_date', now()->month)
                               ->whereYear('sale_date', now()->year)->sum('total');
        $lastMonthSales = Sales::whereMonth('sale_date', now()->subMonth()->month)
                               ->whereYear('sale_date', now()->subMonth()->year)->sum('total');
        $monthChange    = $lastMonthSales > 0
            ? (($monthSales - $lastMonthSales) / $lastMonthSales) * 100 : 0;

        // ── Cached (60–120 seconds) ────────────────────────────────────────
        $totalProducts = Cache::remember("{$cp}.total_products", 60,
            fn() => Products::count());
        $totalStock = Cache::remember("{$cp}.total_stock", 60,
            fn() => Stocks::sum('quantity'));
        $totalCustomers = Cache::remember("{$cp}.total_customers", 60,
            fn() => Customer::count());
        $outstandingBalance = Cache::remember("{$cp}.outstanding", 60,
            fn() => Customer::sum('outstanding_balance'));
        $lowStockCount = Cache::remember("{$cp}.low_stock_count", 60,
            fn() => Products::where('quantity', '<', 10)->where('quantity', '>', 0)->count());

        // ── 30-day revenue trend ───────────────────────────────────────────
        $revRaw = Cache::remember("{$cp}.revenue_30d", 120, fn() =>
            Sales::select(DB::raw('DATE(sale_date) as date'), DB::raw('SUM(total) as revenue'))
                ->where('sale_date', '>=', Carbon::now()->subDays(29))
                ->groupBy('date')->orderBy('date')->get()
        );
        $revLabels = []; $revData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $entry = $revRaw->firstWhere('date', $date);
            $revLabels[] = Carbon::parse($date)->format('M j');
            $revData[]   = $entry ? (float) $entry->revenue : 0;
        }

        // ── Top products this month ────────────────────────────────────────
        $topRaw = Cache::remember("{$cp}.top_products", 120, fn() =>
            Sales::select('product_id', DB::raw('SUM(total) as total_rev'))
                ->with('product')
                ->whereMonth('sale_date', now()->month)
                ->groupBy('product_id')->orderByDesc('total_rev')->take(6)->get()
        );
        $topLabels = []; $topRev = [];
        foreach ($topRaw as $row) {
            $topLabels[] = $row->product?->name ?? 'Unknown';
            $topRev[]    = (float) $row->total_rev;
        }

        // ── Recent sales (real-time) ───────────────────────────────────────
        $recentSales = Sales::with(['product', 'user', 'customer'])
            ->orderBy('created_at', 'desc')->take(8)->get()
            ->map(fn($s) => [
                'product'  => $s->product?->name ?? 'Unknown',
                'customer' => $s->customer?->name ?? $s->customer_name ?? 'Walk-in',
                'amount'   => (float) $s->total,
                'method'   => $s->payment_type ?? 'Cash',
                'ago'      => $s->created_at->diffForHumans(null, true),
            ]);

        // ── Low stock items ────────────────────────────────────────────────
        $lowStockItems = Cache::remember("{$cp}.low_stock_items", 60, fn() =>
            Products::where('quantity', '<', 10)->where('quantity', '>', 0)
                ->orderBy('quantity')->take(5)->get()
                ->map(fn($p) => ['name' => $p->name, 'quantity' => $p->quantity])
        );

        // ── Staff leaderboard ──────────────────────────────────────────────
        $staffLeaderboard = [];
        if (auth()->user()?->usertype == 1) {
            $staffLeaderboard = Cache::remember("{$cp}.staff_today", 60, fn() =>
                Sales::select('user_id', DB::raw('SUM(total) as total_sales'), DB::raw('COUNT(*) as sales_count'))
                    ->with('user')
                    ->whereDate('sale_date', Carbon::today())
                    ->whereNotNull('user_id')
                    ->groupBy('user_id')->orderByDesc('total_sales')->take(5)->get()
                    ->map(fn($r) => [
                        'name'  => $r->user?->name ?? 'Unknown',
                        'sales' => (float) $r->total_sales,
                        'count' => (int) $r->sales_count,
                    ])
            );
        }

        // ── Top selling product this month ─────────────────────────────────
        $topSelling = Cache::remember("{$cp}.top_selling", 120, function() {
            $top = Sales::select('product_id', DB::raw('SUM(quantity) as units'), DB::raw('SUM(total) as revenue'))
                ->with('product')
                ->whereMonth('sale_date', now()->month)
                ->whereYear('sale_date', now()->year)
                ->groupBy('product_id')
                ->orderByDesc('revenue')
                ->first();
            
            if (!$top) return null;
            
            return [
                'name'   => $top->product?->name ?? 'Unknown',
                'units'  => (int) $top->units,
                'revenue'=> (float) $top->revenue,
            ];
        });

        return response()->json([
            'todaysSales'       => (float) $todaysSales,
            'salesChange'       => round($salesChange, 1),
            'totalRevenue'      => (float) $monthSales,
            'revenueChange'     => round($monthChange, 1),
            'totalProducts'     => (int) $totalProducts,
            'productsChange'    => 3.2, // Static for now
            'totalCustomers'    => (int) $totalCustomers,
            'customersChange'   => 18.4, // Static for now
            'topSelling'        => $topSelling,
            'monthSales'        => (float) $monthSales,
            'monthChange'       => round($monthChange, 1),
            'totalStock'        => (int) $totalStock,
            'outstandingBalance'=> (float) $outstandingBalance,
            'lowStockCount'     => (int) $lowStockCount,
            'revenueTrend'      => ['labels' => $revLabels, 'data' => $revData],
            'topProducts'       => ['labels' => $topLabels, 'rev'  => $topRev],
            'recentSales'       => $recentSales,
            'lowStockItems'     => $lowStockItems,
            'staffLeaderboard'  => $staffLeaderboard,
        ]);
    }
}
