<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\EmailSettings;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

class EmailSettingsController extends Controller
{
    /**
     * Get current email settings
     */
    public function index()
    {
        $settings = EmailSettings::first();
        
        if (!$settings) {
            $settings = EmailSettings::create([
                'driver' => 'smtp',
                'host' => env('MAIL_HOST', 'smtp.mailtrap.io'),
                'port' => env('MAIL_PORT', 2525),
                'encryption' => env('MAIL_ENCRYPTION', 'tls'),
                'username' => env('MAIL_USERNAME'),
                'password' => env('MAIL_PASSWORD'),
                'from_address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                'from_name' => env('MAIL_FROM_NAME', 'BinoManager'),
                'is_active' => false,
            ]);
        }

        // Don't send passwords to frontend
        return response()->json([
            'settings' => [
                'id' => $settings->id,
                'driver' => $settings->driver,
                'host' => $settings->host,
                'port' => $settings->port,
                'encryption' => $settings->encryption,
                'username' => $settings->username,
                'from_address' => $settings->from_address,
                'from_name' => $settings->from_name,
                'mailgun_domain' => $settings->mailgun_domain,
                'mailgun_endpoint' => $settings->mailgun_endpoint,
                'ses_region' => $settings->ses_region,
                'is_active' => $settings->is_active,
                'last_tested_at' => $settings->last_tested_at,
                'test_result' => $settings->test_result,
            ]
        ]);
    }

    /**
     * Update email settings
     */
    public function update(Request $request)
    {
        $rules = [
            'driver' => 'required|in:smtp,mailgun,ses,sendmail',
            'from_address' => 'required|email',
            'from_name' => 'required|string|max:255',
        ];

        // Driver-specific validation
        if ($request->driver === 'smtp') {
            $rules['host'] = 'required|string';
            $rules['port'] = 'required|integer';
            $rules['encryption'] = 'nullable|in:tls,ssl';
            $rules['username'] = 'required|string';
            $rules['password'] = 'required|string';
        } elseif ($request->driver === 'mailgun') {
            $rules['mailgun_domain'] = 'required|string';
            $rules['mailgun_secret'] = 'required|string';
            $rules['mailgun_endpoint'] = 'required|string';
        } elseif ($request->driver === 'ses') {
            $rules['ses_key'] = 'required|string';
            $rules['ses_secret'] = 'required|string';
            $rules['ses_region'] = 'required|string';
        }

        $validated = $request->validate($rules);

        $settings = EmailSettings::first();
        
        if (!$settings) {
            $settings = new EmailSettings();
        }

        $settings->fill($validated);
        
        // Deactivate any other active configurations
        EmailSettings::where('id', '!=', $settings->id ?? 0)
            ->where('is_active', true)
            ->update(['is_active' => false]);
        
        $settings->is_active = false; // Require testing before activation
        $settings->save();

        AuditLog::record(
            'email_settings.updated',
            "Updated email settings (driver: {$settings->driver})",
            null,
            ['driver' => $settings->driver]
        );

        return response()->json([
            'message' => 'Email settings updated successfully. Please test the configuration.',
            'settings' => $settings
        ]);
    }

    /**
     * Test email configuration
     */
    public function test(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        $settings = EmailSettings::first();

        if (!$settings) {
            return response()->json([
                'success' => false,
                'message' => 'No email settings configured'
            ], 400);
        }

        try {
            // Temporarily configure mailer with these settings
            $this->configureMailer($settings);

            // Send test email
            Mail::raw('This is a test email from BinoManager. If you received this, your email configuration is working correctly!', function ($message) use ($request, $settings) {
                $message->to($request->test_email)
                    ->subject('BinoManager - Test Email')
                    ->from($settings->from_address, $settings->from_name);
            });

            // Update settings
            $settings->update([
                'last_tested_at' => now(),
                'test_result' => 'Success',
                'is_active' => true,
            ]);

            AuditLog::record(
                'email_settings.tested',
                "Email configuration tested successfully (sent to {$request->test_email})",
                null,
                ['test_email' => $request->test_email]
            );

            return response()->json([
                'success' => true,
                'message' => 'Test email sent successfully! Email configuration is now active.'
            ]);

        } catch (\Exception $e) {
            $settings->update([
                'last_tested_at' => now(),
                'test_result' => 'Failed: ' . $e->getMessage(),
                'is_active' => false,
            ]);

            AuditLog::record(
                'email_settings.test_failed',
                "Email configuration test failed",
                null,
                ['error' => $e->getMessage()]
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate/Deactivate email settings
     */
    public function toggleActive(Request $request)
    {
        $settings = EmailSettings::first();

        if (!$settings) {
            return response()->json(['message' => 'No email settings found'], 404);
        }

        $settings->is_active = !$settings->is_active;
        $settings->save();

        $status = $settings->is_active ? 'activated' : 'deactivated';

        AuditLog::record(
            "email_settings.{$status}",
            "Email settings {$status}",
            null
        );

        return response()->json([
            'message' => "Email settings {$status} successfully",
            'is_active' => $settings->is_active
        ]);
    }

    /**
     * Configure Laravel mailer with custom settings
     */
    private function configureMailer(EmailSettings $settings)
    {
        $config = $settings->toMailConfig();

        Config::set('mail.default', $settings->driver);
        Config::set("mail.mailers.{$settings->driver}", $config);
        Config::set('mail.from.address', $settings->from_address);
        Config::set('mail.from.name', $settings->from_name);

        // Purge the mailer instance to force reconfiguration
        app()->forgetInstance('mail.manager');
        app()->forgetInstance('mailer');
    }
}
