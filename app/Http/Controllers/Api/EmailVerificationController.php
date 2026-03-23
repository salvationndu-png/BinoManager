<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmailVerificationService;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * Get verification status
     */
    public function status(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'status' => EmailVerificationService::getStatus($user)
        ]);
    }

    /**
     * Send verification code
     */
    public function send(Request $request)
    {
        $user = $request->user();

        // Check if already verified
        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified'
            ], 400);
        }

        // Check rate limiting (can only request new code every 2 minutes)
        if ($user->verification_code_expires_at && now()->isBefore($user->verification_code_expires_at->subMinutes(8))) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait before requesting a new code'
            ], 429);
        }

        $sent = EmailVerificationService::sendVerificationCode($user);

        if (!$sent) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to your email',
            'expires_in_minutes' => 10
        ]);
    }

    /**
     * Verify code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6'
        ]);

        $user = $request->user();
        $result = EmailVerificationService::verifyCode($user, $request->code);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Resend verification code
     */
    public function resend(Request $request)
    {
        return $this->send($request);
    }
}
