<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RequiresTenant;
use App\Services\PlanEnforcementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancialController extends Controller
{
    use RequiresTenant;

    public function index(Request $request)
    {
        $tenant = $this->tenant();
        $check  = (new PlanEnforcementService($tenant))->canAccess('financials');
        if (! $check->allowed) return $check->toJsonResponse();

        $tid = $tenant->id;

        $start = $request->input('start', now()->startOfYear()->toDateString());
        $end   = $request->input('end',   now()->toDateString());

        // ── Revenue (all sales in period) ──────────────────────────────────
        $sales = DB::table('sales')
            ->where('tenant_id', $tid)
            ->whereBetween('sale_date', [$start, $end])
            ->get(['total', 'payment_type', 'quantity']);

        $revenue         = (float) $sales->sum('total');
        $cashRevenue     = (float) $sales->where('payment_type', 'Cash')->sum('total');
        $transferRevenue = (float) $sales->where('payment_type', 'Transfer')->sum('total');
        $creditRevenue   = (float) $sales->where('payment_type', 'Credit')->sum('total');

        // ── COGS: quantity_sold * product cost_price ───────────────────────
        $cogs = (float) DB::table('sales')
            ->join('products', 'sales.product_id', '=', 'products.id')
            ->where('sales.tenant_id', $tid)
            ->whereBetween('sales.sale_date', [$start, $end])
            ->whereNull('products.deleted_at')
            ->sum(DB::raw('sales.quantity * COALESCE(products.cost_price, 0)'));

        // ── Stock purchases outflow (quantity restocked * cost_price) ──────
        $stockPurchases = (float) DB::table('stocks')
            ->join('products', 'stocks.product_id', '=', 'products.id')
            ->where('stocks.tenant_id', $tid)
            ->whereBetween(DB::raw('DATE(stocks.created_at)'), [$start, $end])
            ->whereNull('products.deleted_at')
            ->sum(DB::raw('stocks.quantity * COALESCE(products.cost_price, 0)'));

        // ── Current inventory value ────────────────────────────────────────
        $inventoryValue = (float) DB::table('products')
            ->where('tenant_id', $tid)
            ->whereNull('deleted_at')
            ->sum(DB::raw('quantity * COALESCE(cost_price, 0)'));

        // ── Accounts receivable (credit sales minus payments received) ─────
        $totalCreditSales = (float) DB::table('sales')
            ->where('tenant_id', $tid)
            ->where('payment_type', 'Credit')
            ->sum('total');

        $totalCustomerPayments = (float) DB::table('customer_payments')
            ->join('customers', 'customer_payments.customer_id', '=', 'customers.id')
            ->where('customers.tenant_id', $tid)
            ->sum('customer_payments.amount');

        $accountsReceivable = max(0, $totalCreditSales - $totalCustomerPayments);

        // ── Monthly breakdown ──────────────────────────────────────────────
        $monthlyRows = DB::table('sales')
            ->where('tenant_id', $tid)
            ->whereBetween('sale_date', [$start, $end])
            ->selectRaw("DATE_FORMAT(sale_date, '%Y-%m') as month, SUM(total) as revenue, payment_type")
            ->groupBy('month', 'payment_type')
            ->orderBy('month')
            ->get();

        $monthlyMap = [];
        foreach ($monthlyRows as $row) {
            $m = $row->month;
            if (!isset($monthlyMap[$m])) {
                $monthlyMap[$m] = ['month' => $m, 'cash' => 0, 'transfer' => 0, 'credit' => 0, 'total' => 0];
            }
            $key = strtolower($row->payment_type);
            if (isset($monthlyMap[$m][$key])) {
                $monthlyMap[$m][$key] = (float) $row->revenue;
            }
            $monthlyMap[$m]['total'] += (float) $row->revenue;
        }

        // ── Profit calculations ────────────────────────────────────────────
        $grossProfit = $revenue - $cogs;
        $netProfit   = $grossProfit;

        return response()->json([
            'period' => ['start' => $start, 'end' => $end],

            'profit_loss' => [
                'revenue'      => round($revenue, 2),
                'cogs'         => round($cogs, 2),
                'gross_profit' => round($grossProfit, 2),
                'net_profit'   => round($netProfit, 2),
                'gross_margin' => $revenue > 0 ? round(($grossProfit / $revenue) * 100, 1) : 0,
            ],

            'cash_flow' => [
                'cash_inflow'   => round($cashRevenue + $transferRevenue, 2),
                'credit_inflow' => round($creditRevenue, 2),
                'stock_outflow' => round($stockPurchases, 2),
                'net_cash_flow' => round($cashRevenue + $transferRevenue - $stockPurchases, 2),
                'by_payment'    => [
                    'cash'     => round($cashRevenue, 2),
                    'transfer' => round($transferRevenue, 2),
                    'credit'   => round($creditRevenue, 2),
                ],
                'monthly' => array_values($monthlyMap),
            ],

            'balance_sheet' => [
                'assets' => [
                    'inventory'           => round($inventoryValue, 2),
                    'accounts_receivable' => round($accountsReceivable, 2),
                    'total'               => round($inventoryValue + $accountsReceivable, 2),
                ],
                'liabilities' => [
                    'total' => 0,
                ],
                'equity' => [
                    'retained_earnings' => round($inventoryValue + $accountsReceivable, 2),
                ],
            ],

            'summary' => [
                'total_transactions' => $sales->count(),
                'total_revenue'      => round($revenue, 2),
                'net_profit'         => round($netProfit, 2),
                'gross_margin'       => $revenue > 0 ? round(($grossProfit / $revenue) * 100, 1) : 0,
            ],
        ]);
    }
}
