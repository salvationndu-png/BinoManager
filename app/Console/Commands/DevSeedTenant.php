<?php

namespace App\Console\Commands;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantSettings;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * php artisan dev:tenant
 *
 * Creates a demo tenant + admin user for local development.
 * Run this once after `php artisan migrate`.
 *
 * Access the dashboard at:
 *   http://localhost:8000/login?tenant=demo-shop
 */
class DevSeedTenant extends Command
{
    protected $signature   = 'dev:tenant
                                {--slug=demo-shop      : Workspace slug}
                                {--name=Demo Shop      : Business name}
                                {--email=admin@demo.test : Admin email}
                                {--password=Password1  : Admin password}';

    protected $description = 'Seed a local dev tenant + admin user (localhost only)';

    public function handle(): int
    {
        if (config('app.env') !== 'local') {
            $this->error('This command only runs in local environment.');
            return self::FAILURE;
        }

        $slug     = $this->option('slug');
        $name     = $this->option('name');
        $email    = $this->option('email');
        $password = $this->option('password');

        if (Tenant::where('slug', $slug)->exists()) {
            $this->warn("Tenant [{$slug}] already exists.");
            $tenant = Tenant::where('slug', $slug)->first();
        } else {
            $tenant = DB::transaction(function () use ($slug, $name, $email, $password) {
                $plan = Plan::first();

                $tenant = Tenant::create([
                    'name'          => $name,
                    'slug'          => $slug,
                    'email'         => $email,
                    'plan_id'       => $plan?->id,
                    'status'        => 'trialing',
                    'trial_ends_at' => now()->addDays(30),
                ]);

                User::create([
                    'tenant_id' => $tenant->id,
                    'name'      => 'Demo Admin',
                    'email'     => $email,
                    'password'  => Hash::make($password),
                    'usertype'  => 1,
                    'status'    => 1,
                ]);

                TenantSettings::create([
                    'tenant_id'       => $tenant->id,
                    'business_name'   => $name,
                    'timezone'        => 'Africa/Lagos',
                    'currency_symbol' => '₦',
                ]);

                return $tenant;
            });

            $this->info("✓ Tenant [{$slug}] created.");
        }

        $this->newLine();
        $this->line('  <fg=cyan>Dashboard URL:</> http://localhost:8000/home?tenant=' . $tenant->slug);
        $this->line('  <fg=cyan>Login URL:</>    http://localhost:8000/login?tenant=' . $tenant->slug);
        $this->line('  <fg=cyan>Email:</>        ' . $email);
        $this->line('  <fg=cyan>Password:</>     ' . $password);
        $this->newLine();

        return self::SUCCESS;
    }
}
