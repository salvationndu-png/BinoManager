<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\RequiresTenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;
use Laravel\Fortify\Contracts\UpdatesUserPasswords;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;

class ProfileController extends Controller
{
    use RequiresTenant;

    public function updateProfile(Request $request, UpdatesUserProfileInformation $updater)
    {
        $updater->update($request->user(), $request->all());

        return response()->json(['message' => 'Profile updated successfully']);
    }

    public function updatePassword(Request $request, UpdatesUserPasswords $updater)
    {
        $updater->update($request->user(), $request->all());

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function getSessions(Request $request)
    {
        if (config('session.driver') !== 'database') {
            return response()->json(['sessions' => []]);
        }

        $sessions = collect(
            \DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))
                ->where('user_id', $request->user()->getAuthIdentifier())
                ->orderBy('last_activity', 'desc')
                ->get()
        )->map(function ($session) use ($request) {
            $agent = $this->createAgent($session);

            return (object) [
                'agent' => [
                    'is_desktop' => $agent->isDesktop(),
                    'platform' => $agent->platform(),
                    'browser' => $agent->browser(),
                ],
                'ip_address' => $session->ip_address,
                'is_current_device' => $session->id === $request->session()->getId(),
                'last_active' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
            ];
        });

        return response()->json(['sessions' => $sessions]);
    }

    public function logoutOtherSessions(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['The password is incorrect.'],
            ]);
        }

        \Auth::logoutOtherDevices($request->password);

        if (config('session.driver') === 'database') {
            \DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))
                ->where('user_id', $request->user()->getAuthIdentifier())
                ->where('id', '!=', $request->session()->getId())
                ->delete();
        }

        return response()->json(['message' => 'Other sessions logged out successfully']);
    }

    // Two-Factor Authentication
    public function getTwoFactorStatus(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'enabled' => !is_null($user->two_factor_secret),
            'confirmed' => !is_null($user->two_factor_confirmed_at),
        ]);
    }

    public function enableTwoFactor(Request $request, EnableTwoFactorAuthentication $enable)
    {
        $enable($request->user());
        
        $user = $request->user()->fresh();
        
        return response()->json([
            'message' => '2FA enabled. Please confirm with a code.',
            'svg' => $user->twoFactorQrCodeSvg(),
            'secret' => decrypt($user->two_factor_secret),
        ]);
    }

    public function confirmTwoFactor(Request $request, ConfirmTwoFactorAuthentication $confirm)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $confirm($request->user(), $request->code);
        
        $user = $request->user()->fresh();
        
        return response()->json([
            'message' => '2FA confirmed successfully',
            'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
        ]);
    }

    public function disableTwoFactor(Request $request, DisableTwoFactorAuthentication $disable)
    {
        $disable($request->user());
        
        return response()->json(['message' => '2FA disabled successfully']);
    }

    public function getRecoveryCodes(Request $request)
    {
        $user = $request->user();
        
        if (!$user->two_factor_secret) {
            return response()->json(['error' => '2FA not enabled'], 400);
        }
        
        return response()->json([
            'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
        ]);
    }

    public function regenerateRecoveryCodes(Request $request, GenerateNewRecoveryCodes $generate)
    {
        $generate($request->user());
        
        $user = $request->user()->fresh();
        
        return response()->json([
            'message' => 'Recovery codes regenerated',
            'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes), true),
        ]);
    }

    // Email Change
    public function requestEmailChange(Request $request)
    {
        $request->validate([
            'new_email' => 'required|email|unique:users,email',
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The password is incorrect.'],
            ]);
        }

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'pending_email' => $request->new_email,
            'email_change_code' => $code,
            'email_change_code_expires_at' => now()->addMinutes(10),
        ]);

        // Send verification code to new email
        try {
            \Mail::raw(
                "Your email change verification code is: {$code}\n\n" .
                "This code will expire in 10 minutes.\n\n" .
                "If you didn't request this change, please ignore this email.\n\n" .
                "BinoManager",
                function ($message) use ($request) {
                    $message->to($request->new_email)
                            ->subject('Verify Email Change - BinoManager');
                }
            );

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to new email address',
                'pending_email' => $request->new_email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email',
            ], 500);
        }
    }

    public function confirmEmailChange(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->pending_email) {
            return response()->json([
                'success' => false,
                'message' => 'No pending email change',
            ], 400);
        }

        if (now()->isAfter($user->email_change_code_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Verification code has expired',
            ], 400);
        }

        if ($user->email_change_code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code',
            ], 400);
        }

        // Update email
        $user->update([
            'email' => $user->pending_email,
            'pending_email' => null,
            'email_change_code' => null,
            'email_change_code_expires_at' => null,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email changed successfully',
            'new_email' => $user->email,
        ]);
    }

    public function cancelEmailChange(Request $request)
    {
        $user = $request->user();

        $user->update([
            'pending_email' => null,
            'email_change_code' => null,
            'email_change_code_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email change cancelled',
        ]);
    }

    protected function createAgent($session)
    {
        return tap(new \Jenssegers\Agent\Agent, function ($agent) use ($session) {
            $agent->setUserAgent($session->user_agent);
        });
    }
}
