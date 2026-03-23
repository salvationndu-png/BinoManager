<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Models\Customer;
use App\Models\Products;
use App\Models\Sales;
use App\Models\Stocks;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    use \App\Http\Controllers\Concerns\RequiresTenant;
    public function addSale(Request $request)
    {
        $tenant = $this->tenant();
        $tid    = $tenant->id;

        $request->validate([
            'product'          => 'required|array|min:1|max:50',
            'product.*'        => 'required|integer|exists:products,id',
            'quantity'         => 'required|array|min:1|max:50',
            'quantity.*'       => 'required|integer|min:1|max:10000',
            'price'            => 'required|array|min:1|max:50',
            'price.*'          => 'required|numeric|min:0.01|max:99999999',
            'payment_type'     => 'required|in:Cash,Transfer,Credit',
            'sale_date'        => 'nullable|date|before_or_equal:today',
            'customer_id'      => 'nullable|integer|exists:customers,id',
            'customer_name'    => 'nullable|string|max:255',
        ]);

        // Sanitize customer name if provided
        $customerName = $request->customer_name ? InputSanitizer::sanitize($request->customer_name) : null;

        if ($request->payment_type === 'Credit' && !$request->customer_id) {
            return response()->json([
                'success' => false,
                'message' => 'Credit sales can only be made to registered customers. Please select a customer.',
            ]);
        }

        DB::beginTransaction();

        try {
            $customerId   = $request->customer_id ?? null;
            $totalSaleAmount = 0;

            // Pre-calculate total for credit limit check
            foreach ($request->product as $index => $productId) {
                $totalSaleAmount += (int) $request->quantity[$index] * (int) $request->price[$index];
            }

            // Credit limit check WITH lockForUpdate — prevents two concurrent credit sales
            // both slipping through the same limit check simultaneously
            if ($customerId && $request->payment_type === 'Credit') {
                $customer = Customer::lockForUpdate()->find($customerId);
                if ($customer) {
                    $newOutstanding = $customer->outstanding_balance + $totalSaleAmount;
                    if ($newOutstanding > $customer->credit_limit) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Credit limit exceeded! '
                                . 'Limit: ₦' . number_format($customer->credit_limit)
                                . ', Outstanding: ₦' . number_format($customer->outstanding_balance)
                                . ', This sale: ₦' . number_format($totalSaleAmount)
                                . '. Would total: ₦' . number_format($newOutstanding),
                        ]);
                    }
                }
            }

            $totalSaleAmount = 0; // reset to accumulate per-line

            foreach ($request->product as $index => $productId) {
                $quantityRequested = (int) $request->quantity[$index];
                $pricePerUnit      = (int) $request->price[$index];

                $product = Products::lockForUpdate()->find($productId);
                if (!$product) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Product not found.']);
                }

                if ($quantityRequested > $product->quantity) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for {$product->name}. "
                            . "Available: {$product->quantity}, Requested: {$quantityRequested}.",
                    ]);
                }

                // Deduct from product quantity only — stock history rows are immutable
                $product->quantity -= $quantityRequested;
                $product->save();

                $lineTotal = $quantityRequested * $pricePerUnit;
                $totalSaleAmount += $lineTotal;

                Sales::create([
                    'product_id'    => $productId,
                    'quantity'      => $quantityRequested,
                    'price'         => $pricePerUnit,
                    'total'         => $lineTotal,
                    'customer_id'   => $customerId,
                    'customer_name' => $customerName,
                    'payment_type'  => $request->payment_type ?? 'Cash',
                    'sale_date'     => $request->sale_date ?? now(),
                    'user_id'       => Auth::id(),
                ]);
            }

            // Update outstanding balance — customer already locked above
            if ($customerId && $request->payment_type === 'Credit') {
                $customer = Customer::find($customerId);
                if ($customer) {
                    $customer->outstanding_balance += $totalSaleAmount;
                    $customer->save();
                }
            }

            DB::commit();

            // Bust dashboard caches so stats reflect the new sale
            Cache::forget("tenant.{$tid}.dashboard.total_stock");
            Cache::forget("tenant.{$tid}.dashboard.low_stock_count");
            Cache::forget("tenant.{$tid}.dashboard.top_products");
            Cache::forget("tenant.{$tid}.dashboard.revenue_30d");
            Cache::forget("tenant.{$tid}.dashboard.low_stock_items");

            return response()->json([
                'success' => true,
                'message' => 'Sale recorded successfully!',
                'total'   => $totalSaleAmount,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error recording sale. Please try again.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function getTrackSalesData(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'page'       => 'nullable|integer|min:1',
        ]);

        $query = Sales::with(['product', 'user'])->latest();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('sale_date', [$request->start_date, $request->end_date]);
        }

        // Paginate — prevents memory errors and timeouts with large datasets
        // Frontend should use ?page=2, ?page=3 etc.
        $sales = $query->paginate(50);

        return response()->json([
            'success'      => true,
            'sales'        => $sales->items(),
            'totalAmount'  => Sales::when(
                $request->filled('start_date') && $request->filled('end_date'),
                fn($q) => $q->whereBetween('sale_date', [$request->start_date, $request->end_date])
            )->sum('total'),
            'pagination'   => [
                'current_page'  => $sales->currentPage(),
                'last_page'     => $sales->lastPage(),
                'per_page'      => $sales->perPage(),
                'total'         => $sales->total(),
            ],
        ]);
    }
}
