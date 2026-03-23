<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PricingController extends Controller
{
    public function index()
    {
        $monthlyPlans = Plan::where('billing_cycle', 'monthly')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $annualPlans = Plan::where('billing_cycle', 'annual')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return view('pricing', compact('monthlyPlans', 'annualPlans'));
    }

    public function initializePayment(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'email' => 'required|email',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $tenant = app('current.tenant');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.paystack.secret_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'email' => $request->email,
            'amount' => $plan->price_kobo,
            'currency' => 'NGN',
            'reference' => 'BINO-' . strtoupper(uniqid()),
            'callback_url' => route('billing.verify'),
            'metadata' => [
                'plan_id' => $plan->id,
                'tenant_id' => $tenant->id ?? null,
                'billing_cycle' => $plan->billing_cycle,
            ],
        ]);

        if ($response->successful() && $response->json('status')) {
            return response()->json([
                'success' => true,
                'authorization_url' => $response->json('data.authorization_url'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Payment initialization failed',
        ], 500);
    }
}
