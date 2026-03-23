<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Clean up expired sessions daily
        $schedule->command('session:gc')->daily();

        // SaaS: suspend tenants whose grace/trial has expired
        $schedule->command('saas:suspend-expired')->dailyAt('02:00');

        // Send trial expiring soon notifications (3 days before)
        $schedule->call(function () {
            $expiringSoon = \App\Models\Tenant::where('status', 'trialing')
                ->whereDate('trial_ends_at', now()->addDays(3)->toDateString())
                ->get();
            
            foreach ($expiringSoon as $tenant) {
                $tenant->notify(new \App\Notifications\TrialExpiringSoon(3));
            }
        })->dailyAt('09:00');

        // Send trial expiring tomorrow notifications
        $schedule->call(function () {
            $expiringTomorrow = \App\Models\Tenant::where('status', 'trialing')
                ->whereDate('trial_ends_at', now()->addDay()->toDateString())
                ->get();
            
            foreach ($expiringTomorrow as $tenant) {
                $tenant->notify(new \App\Notifications\TrialExpiringSoon(1));
            }
        })->dailyAt('09:00');

        // Send grace period ending notifications (2 days before)
        $schedule->call(function () {
            $graceEnding = \App\Models\Tenant::where('status', 'grace')
                ->whereDate('grace_ends_at', now()->addDays(2)->toDateString())
                ->get();
            
            foreach ($graceEnding as $tenant) {
                $graceDaysLeft = now()->diffInDays($tenant->grace_ends_at);
                $tenant->notify(new \App\Notifications\PaymentFailed($graceDaysLeft));
            }
        })->dailyAt('09:00');
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
