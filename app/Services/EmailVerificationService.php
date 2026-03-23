<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;

class EmailVerificationService
{
    /**
     * Generate and send verification code
     */
    public static function sendVerificationCode(User $user): bool
    {
        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Update user
        $user->update([
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(10),
            'verification_attempts' => 0,
        ]);

        // Send email
        try {
            Mail::raw(
                "Your BinoManager verification code is: {$code}\n\n" .
                "This code will expire in 10 minutes.\n\n" .
                "If you didn't request this code, please ignore this email.\n\n" .
                "Welcome to BinoManager!",
                function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Verify Your Email - BinoManager');
                }
            );

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Verify the code
     */
    public static function verifyCode(User $user, string $code): array
    {
        // Check if already verified
        if ($user->email_verified_at) {
            return [
                'success' => false,
                'message' => 'Email already verified'
            ];
        }

        // Check if code exists
        if (!$user->verification_code) {
            return [
                'success' => false,
                'message' => 'No verification code found. Please request a new one.'
            ];
        }

        // Check if expired
        if (now()->isAfter($user->verification_code_expires_at)) {
            return [
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.'
            ];
        }

        // Check attempts
        if ($user->verification_attempts >= 3) {
            return [
                'success' => false,
                'message' => 'Too many failed attempts. Please request a new code.'
            ];
        }

        // Verify code
        if ($user->verification_code !== $code) {
            $user->increment('verification_attempts');
            
            $remaining = 3 - $user->verification_attempts;
            return [
                'success' => false,
                'message' => "Invalid code. {$remaining} attempts remaining."
            ];
        }

        // Success - mark as verified
        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
            'verification_attempts' => 0,
        ]);

        return [
            'success' => true,
            'message' => 'Email verified successfully!'
        ];
    }

    /**
     * Check if user needs verification
     */
    public static function needsVerification(User $user): bool
    {
        return is_null($user->email_verified_at);
    }

    /**
     * Get verification status
     */
    public static function getStatus(User $user): array
    {
        if ($user->email_verified_at) {
            return [
                'verified' => true,
                'verified_at' => $user->email_verified_at->toISOString(),
            ];
        }

        return [
            'verified' => false,
            'code_sent' => !is_null($user->verification_code),
            'code_expires_at' => $user->verification_code_expires_at?->toISOString(),
            'attempts_remaining' => max(0, 3 - $user->verification_attempts),
        ];
    }
}
