<?php

namespace App\Console\Commands;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantSettings;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * saas:install
 *
 * Run once after deploying SaaS migrations on an existing single-tenant install.
 * Creates the first tenant record and backfills tenant_id on all existing data.
 *
 * Usage: php artisan saas:install
 */
class InstallSaas extends Command
{
    protected $signature   = 'saas:install';
    protected $description = 'Bootstrap multi-tenancy: create first tenant and backfill existing data';

    public function handle(): int
    {
        $this->info('SaaS Install — creating first tenant from existing data...');

        if (Tenant::exists()) {
            $this->warn('Tenants already exist. Skipping. Use saas:backfill to re-run.');
            return Command::FAILURE;
        }

        // Find the first admin user to be the tenant owner
        $admin = User::where('usertype', 1)->orderBy('id')->first();

        if (! $admin) {
            $this->error('No admin user found. Create one first via php artisan tinker.');
            return Command::FAILURE;
        }

        $businessName = $this->ask('What is the business name?', 'My Wholesale Business');
        $slug         = Tenant::generateSlug($businessName);

        $this->info("Slug will be: {$slug}");

        DB::transaction(function () use ($admin, $businessName, $slug) {
            $plan = Plan::where('slug', 'business')->first()
                 ?? Plan::first();

            // Create first tenant as already active (existing business)
            $tenant = Tenant::create([
                'name'    => $businessName,
                'slug'    => $slug,
                'email'   => $admin->email,
                'plan_id' => $plan?->id,
                'status'  => 'active',
            ]);

            TenantSettings::create([
                'tenant_id'       => $tenant->id,
                'business_name'   => $businessName,
                'timezone'        => 'Africa/Lagos',
                'currency_symbol' => '₦',
                'onboarding_completed_at' => now(),
            ]);

            $tables = ['users', 'products', 'stocks', 'sales', 'customers'];
            foreach ($tables as $table) {
                $updated = DB::table($table)
                    ->whereNull('tenant_id')
                    ->update(['tenant_id' => $tenant->id]);
                $this->line("  ✓ {$table}: {$updated} rows backfilled");
            }

            $this->info("✓ Tenant '{$businessName}' created (ID: {$tenant->id}, slug: {$slug})");
        });

        $this->info('Done! Run: php artisan migrate to apply pending migrations.');
        return Command::SUCCESS;
    }
}
