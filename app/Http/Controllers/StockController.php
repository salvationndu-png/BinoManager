<?php

namespace App\Http\Controllers;

use App\Models\Products;
use App\Models\Stocks;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    use \App\Http\Controllers\Concerns\RequiresTenant;
    public function addStock(Request $request)
    {
        $tenant = $this->tenant();
        $tid    = $tenant->id;

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
            'date'       => 'required|date',
            'price'      => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $product = Products::lockForUpdate()->findOrFail($request->product_id);

            // If prices provided (initial stock when adding product), update product prices
            if ($request->filled('price') && $request->filled('cost_price')) {
                $product->price = $request->price;
                $product->cost_price = $request->cost_price;
            }

            // Create immutable stock history entry
            Stocks::create([
                'product_id' => $request->product_id,
                'quantity'   => $request->quantity,
                'date'       => $request->date,
            ]);

            // Add to product quantity (history rows are never mutated)
            $product->quantity += $request->quantity;
            $product->save();
        });

        Cache::forget("tenant.{$tid}.dashboard.total_stock");
        Cache::forget("tenant.{$tid}.dashboard.low_stock_count");
        Cache::forget("tenant.{$tid}.dashboard.low_stock_items");

        return response()->json(['success' => true, 'message' => 'Stock added successfully.']);
    }

    public function getStockList()
    {
        $stocks = Stocks::with('product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($stocks);
    }

    public function deleteStock($id)
    {
        $tenant = $this->tenant();
        $tid    = $tenant->id;
        DB::transaction(function () use ($id) {
            $stock = Stocks::lockForUpdate()->findOrFail($id);

            $product = Products::lockForUpdate()->find($stock->product_id);

            if ($product) {
                $product->quantity -= $stock->quantity;
                if ($product->quantity < 0) $product->quantity = 0;
                $product->save();
            }

            $stock->delete();
        });

        Cache::forget("tenant.{$tid}.dashboard.total_stock");
        Cache::forget("tenant.{$tid}.dashboard.low_stock_count");
        Cache::forget("tenant.{$tid}.dashboard.low_stock_items");

        return response()->json(['success' => true, 'message' => 'Stock deleted successfully.']);
    }

    public function updateStock(Request $request, $id)
    {
        $tenant = $this->tenant();
        $tid    = $tenant->id;
        $request->validate([
            'additional_quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request, $id) {
            $stock   = Stocks::lockForUpdate()->findOrFail($id);
            $product = Products::lockForUpdate()->findOrFail($stock->product_id);

            $stock->quantity += $request->additional_quantity;
            $stock->save();

            $product->quantity += $request->additional_quantity;
            $product->save();
        });

        Cache::forget("tenant.{$tid}.dashboard.total_stock");
        Cache::forget("tenant.{$tid}.dashboard.low_stock_count");

        return response()->json(['success' => true, 'message' => 'Stock updated successfully.']);
    }

    public function updatePrice(Request $request, $id)
    {
        $tenant = $this->tenant();
        $tid    = $tenant->id;
        $request->validate(['price' => 'required|numeric|min:0']);

        // Update product price directly (stocks don't have prices anymore)
        $stock = Stocks::findOrFail($id);
        $product = Products::findOrFail($stock->product_id);
        
        $product->price = $request->price;
        $product->save();

        return response()->json(['success' => true, 'message' => 'Price updated successfully.']);
    }
}
