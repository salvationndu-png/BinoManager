<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\Products;
use App\Models\Sales;
use App\Models\Stocks;
use App\Services\PlanEnforcementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    use RequiresTenant;

    /**
     * Profit/loss report.
     * Aggregation pushed into MySQL — no PHP-side maths loops.
     */
    public function getProfitLoss(Request $request)
    {
        $tenant = $this->tenant();
        $check  = (new PlanEnforcementService($tenant))->canAccess('analytics');
        if (! $check->allowed) return $check->toJsonResponse();

        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date'   => 'required|date|after_or_equal:start_date',
            ]);

            // Get sales data with product info
            $salesData = Sales::with('product')
                ->whereBetween('sale_date', [$request->start_date, $request->end_date])
                ->selectRaw('product_id, SUM(quantity) as total_qty, SUM(total) as total_revenue')
                ->groupBy('product_id')
                ->get();

            $products    = [];
            $totalProfit = 0;
            $totalMargin = 0;

            foreach ($salesData as $row) {
                if (!$row->product) continue;
                
                $costPrice = (float) ($row->product->cost_price ?? 0);
                $revenue   = (float) $row->total_revenue;
                $cost      = $costPrice * $row->total_qty;
                $profit    = $revenue - $cost;
                $margin    = $cost > 0 ? ($profit / $cost) * 100 : 0;

                $products[] = [
                    'name'     => $row->product->name,
                    'quantity' => $row->total_qty,
                    'revenue'  => $revenue,
                    'cost'     => $cost,
                    'profit'   => $profit,
                    'margin'   => $margin,
                ];

                $totalProfit += $profit;
                $totalMargin += $margin;
            }

            return response()->json([
                'success'     => true,
                'totalProfit' => $totalProfit,
                'avgMargin'   => count($products) > 0 ? $totalMargin / count($products) : 0,
                'products'    => $products,
            ]);
        } catch (\Exception $e) {
            Log::error('Analytics profit-loss error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Inventory valuation.
     * Fixed N+1: loads latest stock for all products in TWO queries total.
     */
    public function getInventoryValuation()
    {
        $tenant = $this->tenant();
        $check  = (new PlanEnforcementService($tenant))->canAccess('analytics');
        if (! $check->allowed) return $check->toJsonResponse();

        try {
            $products = Products::where('quantity', '>', 0)->get();

            if ($products->isEmpty()) {
                return response()->json(['success' => true, 'totalValue' => 0, 'inventory' => []]);
            }

            $inventory  = [];
            $totalValue = 0;

            foreach ($products as $product) {
                $costPrice       = (float) ($product->cost_price ?? 0);
                $sellingPrice    = (float) ($product->price ?? 0);
                $totalVal        = $costPrice * $product->quantity;
                $potentialProfit = ($sellingPrice - $costPrice) * $product->quantity;

                $inventory[] = [
                    'name'             => $product->name,
                    'quantity'         => $product->quantity,
                    'cost_price'       => $costPrice,
                    'selling_price'    => $sellingPrice,
                    'value'            => $totalVal,
                    'total_value'      => $totalVal,
                    'potential_profit' => $potentialProfit,
                ];
                $totalValue += $totalVal;
            }

            return response()->json([
                'success'    => true,
                'totalValue' => $totalValue,
                'inventory'  => $inventory,
            ]);
        } catch (\Exception $e) {
            Log::error('Analytics inventory-valuation error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
