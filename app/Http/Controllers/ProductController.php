<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\Products;
use App\Services\PlanEnforcementService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use RequiresTenant;
    public function addProduct(Request $request)
    {
        $tenant = $this->tenant();

        $enforcement = new PlanEnforcementService($tenant);
        $check = $enforcement->canAddProduct();
        if (! $check->allowed) {
            return $check->toJsonResponse();
        }

        $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                \Illuminate\Validation\Rule::unique('products', 'name')
                    ->where('tenant_id', $tenant->id)
                    ->whereNull('deleted_at'),
            ],
            'barcode' => [
                'nullable', 'string', 'max:255',
                \Illuminate\Validation\Rule::unique('products', 'barcode')
                    ->where('tenant_id', $tenant->id)
                    ->whereNull('deleted_at'),
            ],
        ]);

        $product = Products::create([
            'name'    => InputSanitizer::sanitize($request->name),
            'barcode' => InputSanitizer::sanitize($request->barcode),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added successfully.',
            'product' => ['id' => $product->id, 'name' => $product->name, 'barcode' => $product->barcode],
        ]);
    }

    public function updateProduct(Request $request, $id)
    {
        $tenant = $this->tenant();
        $product = Products::findOrFail($id);

        $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                \Illuminate\Validation\Rule::unique('products', 'name')
                    ->where('tenant_id', $tenant->id)
                    ->whereNull('deleted_at')
                    ->ignore($id),
            ],
            'barcode' => [
                'nullable', 'string', 'max:255',
                \Illuminate\Validation\Rule::unique('products', 'barcode')
                    ->where('tenant_id', $tenant->id)
                    ->whereNull('deleted_at')
                    ->ignore($id),
            ],
        ]);

        $product->update([
            'name'    => InputSanitizer::sanitize($request->name),
            'barcode' => InputSanitizer::sanitize($request->barcode),
        ]);

        return response()->json(['success' => true, 'message' => 'Product updated successfully.', 'product' => $product]);
    }

    public function getProducts()
    {
        // Only return products with stock and prices set (used by Sales page)
        $products = Products::where('quantity', '>', 0)
            ->where('price', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'quantity', 'price', 'cost_price', 'barcode']);
        return response()->json($products);
    }

    public function getAllProducts()
    {
        // Return all products regardless of quantity (used by Inventory page)
        $products = Products::orderBy('name')
            ->get(['id', 'name', 'quantity', 'price', 'cost_price', 'barcode']);
        return response()->json(['data' => $products]);
    }

    public function getByBarcode($barcode)
    {
        $product = Products::where('barcode', $barcode)
            ->where('quantity', '>', 0)
            ->where('price', '>', 0)
            ->first(['id', 'name', 'quantity', 'price', 'cost_price', 'barcode']);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found.'], 404);
        }

        return response()->json(['success' => true, 'product' => $product]);
    }

    public function deleteProduct($id)
    {
        $product = Products::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found.'], 404);
        }

        $product->delete(); // soft delete — preserves sales history

        return response()->json(['success' => true, 'message' => 'Product deleted successfully.']);
    }

    public function getQuantity($id)
    {
        $product = Products::find($id);

        if ($product) {
            return response()->json(['success' => true, 'quantity' => $product->quantity]);
        }

        return response()->json(['success' => false, 'message' => 'Product not found.'], 404);
    }

    public function getProductDetails($id)
    {
        $product = Products::find($id);

        if ($product) {
            return response()->json([
                'success'  => true,
                'quantity' => $product->quantity,
                'price'    => $product->price,
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Product not found.'], 404);
    }
}
