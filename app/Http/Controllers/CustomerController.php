<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\Customer;
use App\Models\CustomerPayment;
use App\Services\PlanEnforcementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    use RequiresTenant;

    private function checkCustomerAccess()
    {
        $tenant = $this->tenant();
        $enforcement = new PlanEnforcementService($tenant);
        $check = $enforcement->canAccess('customers');
        
        if (!$check->allowed) {
            return $check->toJsonResponse();
        }
        
        return null;
    }

    public function index()
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }
        return view('customers.index');
    }

    public function getCustomers()
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }

        $customers = Customer::withCount('sales')
            ->withSum('sales', 'total')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($customers);
    }

    public function getCustomersForSales()
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }

        $customers = Customer::select('id', 'name', 'business_name', 'credit_limit', 'outstanding_balance')
            ->orderBy('name')
            ->get();

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'business_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'credit_limit' => 'nullable|numeric|min:0',
        ]);

        $sanitized = InputSanitizer::sanitizeFields($request->all(), [
            'name', 'phone', 'business_name', 'address'
        ]);

        $customer = Customer::create($sanitized);

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully',
            'customer' => $customer
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'business_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'credit_limit' => 'nullable|numeric|min:0',
        ]);

        $sanitized = InputSanitizer::sanitizeFields($request->all(), [
            'name', 'phone', 'business_name', 'address'
        ]);

        $customer = Customer::findOrFail($id);
        $customer->update($sanitized);

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully',
            'customer' => $customer
        ]);
    }

    public function destroy($id)
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully'
        ]);
    }

    public function show($id)
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }
        $customer = Customer::with(['sales' => function($query) {
            $query->with('product')->latest()->take(10);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'customer' => $customer
        ]);
    }

    public function recordPayment(Request $request, $id)
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:50',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:1000'
        ]);

        $customer = Customer::findOrFail($id);

        if ($request->amount > $customer->outstanding_balance) {
            return response()->json([
                'success' => false,
                'message' => 'Payment amount cannot exceed outstanding balance of ₦' . number_format($customer->outstanding_balance, 2)
            ]);
        }

        CustomerPayment::create([
            'customer_id' => $id,
            'amount' => $request->amount,
            'payment_method' => InputSanitizer::sanitize($request->payment_method),
            'notes' => InputSanitizer::sanitize($request->notes),
            'payment_date' => $request->payment_date,
            'recorded_by' => Auth::id()
        ]);

        $customer->outstanding_balance -= $request->amount;
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'new_balance' => $customer->outstanding_balance
        ]);
    }

    public function getPayments($id)
    {
        if ($response = $this->checkCustomerAccess()) {
            return $response;
        }
        $payments = CustomerPayment::where('customer_id', $id)
            ->with('recordedBy')
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'payments' => $payments
        ]);
    }
}
