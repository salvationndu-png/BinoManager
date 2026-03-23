<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payments;
use KingFlamez\Rave\Facades\Rave as Flutterwave;

class FlutterwaveController extends Controller
{
    public function initialize(Request $request)
    {
        $request->validate([
            'email'  => 'required|email|max:255',
            'amount' => 'required|numeric|min:100',
            'name'   => 'required|string|max:255',
            'phone'  => 'nullable|string|max:20',
        ]);

        $reference = Flutterwave::generateReference();

        $data = [
            'payment_options' => 'card,banktransfer',
            'amount'          => $request->amount,
            'email'           => $request->email,
            'tx_ref'          => $reference,
            'currency'        => 'NGN',
            'redirect_url'    => route('callback'),
            'customer'        => [
                'email'        => $request->email,
                'phone_number' => $request->phone ?? '',
                'name'         => $request->name,
            ],
            'customizations'  => [
                'title'       => 'Wholesale Manager',
                'description' => 'Payment',
            ],
        ];

        $payment = Flutterwave::initializePayment($data);

        if ($payment['status'] !== 'success') {
            return back()->withErrors(['error' => 'Payment initialization failed. Please try again.']);
        }

        return redirect($payment['data']['link']);
    }

    public function callback(Request $request)
    {
        $status = $request->status;

        if ($status === 'successful') {
            $transactionID = Flutterwave::getTransactionIDFromCallback();
            $data          = Flutterwave::verifyTransaction($transactionID);

            // Verify the transaction is actually successful on Flutterwave's side
            if ($data['data']['status'] !== 'successful') {
                \Log::warning('Flutterwave: callback said successful but verification failed', [
                    'transaction_id' => $transactionID,
                ]);
                return redirect('/')->withErrors(['error' => 'Payment verification failed.']);
            }

            // Save the payment record
            Payments::create([
                'email'    => $data['data']['customer']['email'] ?? null,
                'status'   => $data['data']['status'],
                'amount'   => $data['data']['amount'],
                'trans_id' => $data['data']['id'],
                'ref_id'   => $data['data']['tx_ref'],
            ]);

            return redirect('/')->with('status', 'Payment successful. Thank you!');

        } elseif ($status === 'cancelled') {
            return redirect('/')->with('status', 'Payment was cancelled.');
        } else {
            return redirect('/')->withErrors(['error' => 'Payment failed. Please try again.']);
        }
    }
}
