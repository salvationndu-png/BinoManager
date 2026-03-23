<?php

namespace App\Services;

use App\Models\EmailSettings;
use Illuminate\Support\Facades\Config;

class MailConfigService
{
    /**
     * Configure mail settings from database if active, otherwise use .env
     */
    public static function configure()
    {
        $settings = EmailSettings::where('is_active', true)->first();

        if ($settings) {
            // Use database settings (Super Admin configured)
            self::applyDatabaseSettings($settings);
        }
        // Otherwise, Laravel will use .env settings automatically
    }

    /**
     * Apply database email settings to Laravel config
     */
    private static function applyDatabaseSettings(EmailSettings $settings)
    {
        $config = $settings->toMailConfig();

        Config::set('mail.default', $settings->driver);
        Config::set("mail.mailers.{$settings->driver}", $config);
        Config::set('mail.from.address', $settings->from_address);
        Config::set('mail.from.name', $settings->from_name);

        // Purge mailer instance to force reconfiguration
        app()->forgetInstance('mail.manager');
        app()->forgetInstance('mailer');
    }

    /**
     * Get current active configuration source
     */
    public static function getActiveSource(): string
    {
        $settings = EmailSettings::where('is_active', true)->first();
        
        if ($settings) {
            return "Database (Super Admin) - {$settings->driver}";
        }
        
        return ".env File - " . config('mail.default');
    }

    /**
     * Check if database settings are active
     */
    public static function isDatabaseActive(): bool
    {
        return EmailSettings::where('is_active', true)->exists();
    }
}
