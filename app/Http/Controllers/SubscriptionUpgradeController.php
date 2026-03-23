<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionUpgradeController extends Controller
{
    /**
     * Calculate prorated discount for monthly → annual upgrade
     */
    public function calculateUpgrade(Request $request)
    {
        $tenant = app('current.tenant');
        $subscription = $tenant->subscription;

        if (!$subscription || $subscription->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 400);
        }

        $currentPlan = $subscription->plan;
        
        // Only allow upgrade from monthly to annual
        if ($currentPlan->billing_cycle !== 'monthly') {
            return response()->json([
                'success' => false,
                'message' => 'You are already on an annual plan'
            ], 400);
        }

        // Find corresponding annual plan
        $annualPlan = Plan::where('name', $currentPlan->name)
            ->where('billing_cycle', 'annual')
            ->where('is_active', true)
            ->first();

        if (!$annualPlan) {
            return response()->json([
                'success' => false,
                'message' => 'Annual plan not available'
            ], 404);
        }

        // Calculate remaining days in current billing cycle
        $now = Carbon::now();
        $nextPaymentDate = Carbon::parse($subscription->next_payment_date);
        $daysRemaining = $now->diffInDays($nextPaymentDate, false);
        
        if ($daysRemaining < 0) {
            $daysRemaining = 0;
        }

        // Calculate prorated credit (unused portion of monthly subscription)
        $monthlyPrice = $currentPlan->price_kobo;
        $daysInMonth = $now->daysInMonth;
        $proratedCredit = ($monthlyPrice / $daysInMonth) * $daysRemaining;

        // Calculate final amount to pay
        $annualPrice = $annualPlan->price_kobo;
        $amountToPay = $annualPrice - $proratedCredit;

        // Calculate savings
        $monthlyYearlyCost = $monthlyPrice * 12;
        $totalSavings = $monthlyYearlyCost - $annualPrice;
        $additionalSavings = $proratedCredit;

        return response()->json([
            'success' => true,
            'current_plan' => [
                'name' => $currentPlan->name,
                'price' => $currentPlan->price_naira,
                'billing_cycle' => 'monthly'
            ],
            'annual_plan' => [
                'name' => $annualPlan->name,
                'price' => $annualPlan->price_naira,
                'monthly_equivalent' => $annualPlan->monthly_equivalent,
                'billing_cycle' => 'annual'
            ],
            'upgrade_details' => [
                'days_remaining' => $daysRemaining,
                'prorated_credit' => '₦' . number_format($proratedCredit / 100, 2),
                'amount_to_pay' => '₦' . number_format($amountToPay / 100, 2),
                'amount_to_pay_kobo' => (int) $amountToPay,
                'annual_savings' => '₦' . number_format($totalSavings / 100, 0),
                'additional_savings' => '₦' . number_format($additionalSavings / 100, 2),
                'total_savings' => '₦' . number_format(($totalSavings + $additionalSavings) / 100, 0)
            ]
        ]);
    }

    /**
     * Process upgrade from monthly to annual
     */
    public function processUpgrade(Request $request)
    {
        $request->validate([
            'annual_plan_id' => 'required|exists:plans,id'
        ]);

        $tenant = app('current.tenant');
        $subscription = $tenant->subscription;

        if (!$subscription || $subscription->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 400);
        }

        $annualPlan = Plan::findOrFail($request->annual_plan_id);

        if ($annualPlan->billing_cycle !== 'annual') {
            return response()->json([
                'success' => false,
                'message' => 'Selected plan is not an annual plan'
            ], 400);
        }

        // Calculate prorated amount
        $calculation = $this->calculateUpgrade($request);
        
        if (!$calculation->getData()->success) {
            return $calculation;
        }

        $amountToPayKobo = $calculation->getData()->upgrade_details->amount_to_pay_kobo;

        // Return payment details for frontend to initiate Paystack
        return response()->json([
            'success' => true,
            'message' => 'Upgrade calculation complete',
            'payment_required' => true,
            'amount_kobo' => $amountToPayKobo,
            'plan_id' => $annualPlan->id,
            'redirect_to_checkout' => true
        ]);
    }

    /**
     * Show upgrade page
     */
    public function showUpgradePage()
    {
        $tenant = app('current.tenant');
        $subscription = $tenant->subscription;

        if (!$subscription || $subscription->status !== 'active') {
            return redirect()->route('billing')->with('error', 'No active subscription found');
        }

        $currentPlan = $subscription->plan;

        if ($currentPlan->billing_cycle !== 'monthly') {
            return redirect()->route('billing')->with('info', 'You are already on an annual plan');
        }

        // Get corresponding annual plan
        $annualPlan = Plan::where('name', $currentPlan->name)
            ->where('billing_cycle', 'annual')
            ->where('is_active', true)
            ->first();

        return view('subscription.upgrade', compact('currentPlan', 'annualPlan', 'subscription'));
    }
}
