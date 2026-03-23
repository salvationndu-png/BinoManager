<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function index()
    {
        $gateways = PaymentGateway::orderBy('name')->get();
        return view('superadmin.payments', compact('gateways'));
    }

    public function update(Request $request, $id)
    {
        $gateway = PaymentGateway::findOrFail($id);

        $validated = $request->validate([
            'public_key' => 'nullable|string|max:500',
            'secret_key' => 'nullable|string|max:500',
            'webhook_secret' => 'nullable|string|max:500',
            'currency' => 'required|string|size:3',
            'is_active' => 'boolean',
        ]);

        // Log the change for audit trail
        Log::info('Payment gateway configuration updated', [
            'gateway_id' => $gateway->id,
            'gateway_name' => $gateway->name,
            'admin_id' => auth('super_admin')->id(),
            'admin_name' => auth('super_admin')->user()->name,
            'changed_fields' => array_keys($validated),
            'is_active' => $request->boolean('is_active'),
        ]);

        // Only update keys if they're provided (not empty)
        if (empty($validated['public_key'])) {
            unset($validated['public_key']);
        }
        if (empty($validated['secret_key'])) {
            unset($validated['secret_key']);
        }
        if (empty($validated['webhook_secret'])) {
            unset($validated['webhook_secret']);
        }

        // If activating this gateway, deactivate others
        if ($request->boolean('is_active')) {
            PaymentGateway::where('id', '!=', $id)->update(['is_active' => false]);
            
            Log::warning('Payment gateway activated', [
                'gateway_id' => $gateway->id,
                'gateway_name' => $gateway->name,
                'admin_id' => auth('super_admin')->id(),
            ]);
        }

        $gateway->update($validated);

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => $gateway->name . ' updated successfully!']);
        }
        return back()->with('success', $gateway->name . ' updated successfully!');
    }

    public function toggleActive($id)
    {
        $gateway = PaymentGateway::findOrFail($id);

        if (!$gateway->is_active) {
            // Deactivate all others
            PaymentGateway::where('id', '!=', $id)->update(['is_active' => false]);
            $gateway->update(['is_active' => true]);
            
            Log::warning('Payment gateway activated via toggle', [
                'gateway_id' => $gateway->id,
                'gateway_name' => $gateway->name,
                'admin_id' => auth('super_admin')->id(),
            ]);
            
            $message = $gateway->name . ' activated successfully!';
        } else {
            $gateway->update(['is_active' => false]);
            
            Log::warning('Payment gateway deactivated', [
                'gateway_id' => $gateway->id,
                'gateway_name' => $gateway->name,
                'admin_id' => auth('super_admin')->id(),
            ]);
            
            $message = $gateway->name . ' deactivated.';
        }

        if (request()->expectsJson()) {
            return response()->json(['success' => true, 'message' => $message]);
        }
        return back()->with('success', $message);
    }
}
