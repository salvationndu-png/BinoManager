<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\MailConfigService;

class MailConfigServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Configure mail settings on every request
        // Database settings override .env if active
        MailConfigService::configure();
    }
}
