<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnnualPlansSeeder extends Seeder
{
    public function run()
    {
        // Annual plans with 17% discount (2 free months)
        DB::table('plans')->insert([
            [
                'name'         => 'Starter',
                'slug'         => 'starter-annual',
                'billing_cycle' => 'annual',
                'price_kobo'   => 4980000,   // ₦49,800/year (₦4,150/month)
                'max_users'    => 1,
                'max_products' => 50,
                'features'     => json_encode([
                    '1 user account',
                    'Up to 50 products',
                    'Sales & stock tracking',
                    'Basic analytics',
                    'CSV export',
                ]),
                'is_active'    => true,
                'is_popular'   => false,
                'sort_order'   => 1,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'name'         => 'Business',
                'slug'         => 'business-annual',
                'billing_cycle' => 'annual',
                'price_kobo'   => 14940000,  // ₦149,400/year (₦12,450/month)
                'max_users'    => 5,
                'max_products' => 0,
                'features'     => json_encode([
                    'Up to 5 user accounts',
                    'Unlimited products',
                    'Full analytics & profit/loss',
                    'Customer credit management',
                    'CSV export & print reports',
                    'Email notifications',
                ]),
                'is_active'    => true,
                'is_popular'   => true,  // Most popular badge
                'sort_order'   => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'name'         => 'Enterprise',
                'slug'         => 'enterprise-annual',
                'billing_cycle' => 'annual',
                'price_kobo'   => 34860000,  // ₦348,600/year (₦29,050/month)
                'max_users'    => 0,
                'max_products' => 0,
                'features'     => json_encode([
                    'Unlimited users',
                    'Unlimited products',
                    'Custom business branding',
                    'Priority support',
                    'API access',
                    'Advanced analytics',
                    'Team invitations',
                ]),
                'is_active'    => true,
                'is_popular'   => false,
                'sort_order'   => 3,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);
    }
}
