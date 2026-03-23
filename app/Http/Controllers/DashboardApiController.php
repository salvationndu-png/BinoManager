<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\Products;
use App\Models\Stocks;
use App\Models\Sales;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use DB;

/**
 * DashboardApiController
 *
 * Returns all data needed by the React dashboard in a single request.
 * All cache keys are namespaced under tenant.{id} to prevent cross-tenant leakage.
 */
class DashboardApiController extends Controller
{
    use RequiresTenant;

    public function index()
    {
        $tenant  = $this->tenant();
        $tid     = $tenant->id;
        $cp      = "tenant.{$tid}.dashboard";
        $isAdmin = Auth::user()->usertype == 1;

        // ── Core KPIs ──────────────────────────────────────────────────────
        $totalProducts    = Cache::remember("{$cp}.total_products", 60, fn() => Products::count());
        $totalStock       = Cache::remember("{$cp}.total_stock", 60, fn() => Stocks::sum('quantity'));
        $totalCustomers   = Cache::remember("{$cp}.total_customers", 60, fn() => Customer::count());
        $outstandingBalance = Cache::remember("{$cp}.outstanding", 60, fn() => Customer::sum('outstanding_balance'));
        $lowStockCount    = Cache::remember("{$cp}.low_stock_count", 60, fn() => Products::where('quantity','<',10)->where('quantity','>',0)->count());

        // ── Sales (real-time) ──────────────────────────────────────────────
        $todaysSales    = Sales::whereDate('sale_date', Carbon::today())->sum('total');
        $yesterdaySales = Sales::whereDate('sale_date', Carbon::yesterday())->sum('total');
        $salesChange    = $yesterdaySales > 0 ? (($todaysSales - $yesterdaySales) / $yesterdaySales) * 100 : 0;

        $monthSales     = Sales::whereMonth('sale_date', now()->month)->whereYear('sale_date', now()->year)->sum('total');
        $lastMonth = now()->subMonth();
        $lastMonthSales = Sales::whereMonth('sale_date', $lastMonth->month)->whereYear('sale_date', $lastMonth->year)->sum('total');
        $monthChange    = $lastMonthSales > 0 ? (($monthSales - $lastMonthSales) / $lastMonthSales) * 100 : 0;

        // ── 30-day revenue trend ───────────────────────────────────────────
        $revTrendRaw = Cache::remember("{$cp}.revenue_30d", 120, fn() =>
            Sales::select(DB::raw('DATE(sale_date) as date'), DB::raw('SUM(total) as revenue'))
                ->where('sale_date', '>=', Carbon::now()->subDays(29))
                ->groupBy('date')->orderBy('date')->get()
        );
        $revenueTrend = ['labels' => [], 'data' => []];
        for ($i = 29; $i >= 0; $i--) {
            $date  = Carbon::today()->subDays($i)->toDateString();
            $entry = $revTrendRaw->firstWhere('date', $date);
            $revenueTrend['labels'][] = Carbon::parse($date)->format('M j');
            $revenueTrend['data'][]   = $entry ? (float) $entry->revenue : 0;
        }

        // ── Top products this month ────────────────────────────────────────
        $topProductsRaw = Cache::remember("{$cp}.top_products", 120, fn() =>
            Sales::select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total) as total_rev'))
                ->with('product:id,name')
                ->whereMonth('sale_date', now()->month)
                ->groupBy('product_id')->orderByDesc('total_rev')->take(6)->get()
                ->map(fn($row) => [
                    'name'      => $row->product?->name ?? 'Unknown',
                    'total_qty' => (int) $row->total_qty,
                    'total_rev' => (float) $row->total_rev,
                ])->toArray()
        );
        $topProducts = ['labels' => [], 'qty' => [], 'rev' => []];
        foreach ($topProductsRaw as $row) {
            $topProducts['labels'][] = is_array($row) ? $row['name'] : ($row->product?->name ?? 'Unknown');
            $topProducts['qty'][]    = is_array($row) ? $row['total_qty'] : (int) $row->total_qty;
            $topProducts['rev'][]    = is_array($row) ? $row['total_rev'] : (float) $row->total_rev;
        }

        // ── Recent sales (last 8, real-time) ──────────────────────────────
        $recentSalesRaw = Sales::with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(8)->get();

        $recentSales = $recentSalesRaw->map(fn($s) => [
            'product'  => $s->product?->name ?? 'Unknown Product',
            'customer' => $s->customer_name ?? ($s->customer?->name ?? 'Walk-in'),
            'amount'   => (float) $s->total,
            'method'   => $s->payment_type ?? 'Cash',
            'ago'      => $s->created_at->diffForHumans(null, true),
        ]);

        // ── Low stock items ────────────────────────────────────────────────
        $lowStockItems = Cache::remember("{$cp}.low_stock_items", 60, fn() =>
            Products::where('quantity','<',10)->where('quantity','>',0)
                ->orderBy('quantity')->take(5)->get()
                ->map(fn($p) => ['name' => $p->name, 'quantity' => $p->quantity])
                ->toArray()
        );

        // ── Staff leaderboard (admin only) ─────────────────────────────────
        $staffLeaderboard = [];
        if ($isAdmin) {
            $staffLeaderboard = Cache::remember("{$cp}.staff_today", 60, fn() =>
                Sales::select('user_id', DB::raw('SUM(total) as total_sales'), DB::raw('COUNT(*) as sales_count'))
                    ->with('user')
                    ->whereDate('sale_date', Carbon::today())
                    ->whereNotNull('user_id')
                    ->groupBy('user_id')->orderByDesc('total_sales')->take(5)->get()
                    ->map(fn($e) => [
                        'name'  => $e->user?->name ?? 'Unknown',
                        'sales' => (float) $e->total_sales,
                        'count' => (int) $e->sales_count,
                    ])->toArray()
            );
        }


        // ── Additional KPI changes ─────────────────────────────────────────
        $productsThisMonth = Cache::remember("{$cp}.products_this_month", 120, fn() =>
            Products::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count()
        );
        $productsLastMonth = Cache::remember("{$cp}.products_last_month", 300, fn() =>
            Products::whereMonth('created_at', $lastMonth->month)->whereYear('created_at', $lastMonth->year)->count()
        );
        $productsChange = $productsLastMonth > 0
            ? round((($productsThisMonth - $productsLastMonth) / $productsLastMonth) * 100, 1)
            : ($productsThisMonth > 0 ? 100.0 : 0.0);

        $customersThisMonth = Cache::remember("{$cp}.customers_this_month", 120, fn() =>
            Customer::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count()
        );
        $customersLastMonth = Cache::remember("{$cp}.customers_last_month", 300, fn() =>
            Customer::whereMonth('created_at', $lastMonth->month)->whereYear('created_at', $lastMonth->year)->count()
        );
        $customersChange = $customersLastMonth > 0
            ? round((($customersThisMonth - $customersLastMonth) / $customersLastMonth) * 100, 1)
            : ($customersThisMonth > 0 ? 100.0 : 0.0);

        // ── Top selling product this month ─────────────────────────────────
        $topSelling = null;
        if (!empty($topProductsRaw)) {
            $top = is_array($topProductsRaw[0]) ? $topProductsRaw[0] : null;
            if ($top) {
                $topSelling = [
                    'name'    => $top['name'],
                    'units'   => $top['total_qty'],
                    'revenue' => $top['total_rev'],
                ];
            }
        }

        return response()->json([
            'todaysSales'        => (float) $todaysSales,
            'salesChange'        => (float) $salesChange,
            'monthSales'         => (float) $monthSales,
            'monthChange'        => (float) $monthChange,
            'totalProducts'      => (int) $totalProducts,
            'totalStock'         => (int) $totalStock,
            'totalCustomers'     => (int) $totalCustomers,
            'outstandingBalance' => (float) $outstandingBalance,
            'lowStockCount'      => (int) $lowStockCount,
            'revenueTrend'       => $revenueTrend,
            'topProducts'        => $topProducts,
            'recentSales'        => $recentSales,
            'lowStockItems'      => $lowStockItems,
            'staffLeaderboard'   => $staffLeaderboard,
            'productsChange'     => (float) $productsChange,
            'customersChange'    => (float) $customersChange,
            'topSelling'         => $topSelling,
        ]);
    }
}
