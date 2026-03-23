<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Runs daily via the scheduler.
 * Moves tenants from 'grace' → 'suspended' once their grace period expires.
 * Also cleans up trial tenants that never subscribed.
 */
class SuspendExpiredTenants extends Command
{
    protected $signature   = 'saas:suspend-expired';
    protected $description = 'Suspend tenants whose grace period or trial has expired';

    public function handle(): int
    {
        // 1. Grace period expired → suspended
        $graceExpired = Tenant::where('status', 'grace')
            ->where('grace_ends_at', '<', now())
            ->get();

        foreach ($graceExpired as $tenant) {
            $tenant->update(['status' => 'suspended']);
            Log::info('Tenant suspended: grace expired', ['tenant_id' => $tenant->id, 'slug' => $tenant->slug]);
            $this->line("  Suspended (grace expired): {$tenant->name} [{$tenant->slug}]");
        }

        // 2. Trial expired with no subscription → suspended
        $trialExpired = Tenant::where('status', 'trialing')
            ->where('trial_ends_at', '<', now())
            ->whereDoesntHave('activeSubscription')
            ->get();

        foreach ($trialExpired as $tenant) {
            $tenant->update(['status' => 'suspended']);
            
            // Send trial expired notification
            $tenant->notify(new \App\Notifications\TrialExpired());
            
            Log::info('Tenant suspended: trial expired', ['tenant_id' => $tenant->id, 'slug' => $tenant->slug]);
            $this->line("  Suspended (trial expired): {$tenant->name} [{$tenant->slug}]");
        }

        $total = $graceExpired->count() + $trialExpired->count();
        $this->info("Done. {$total} tenant(s) suspended.");

        return Command::SUCCESS;
    }
}
