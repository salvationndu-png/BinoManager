<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // "Starter", "Business", "Enterprise"
            $table->string('slug')->unique();          // "starter", "business", "enterprise"
            $table->unsignedBigInteger('price_kobo');  // Price in kobo (₦5000 = 500000 kobo)
            $table->unsignedSmallInteger('max_users')->default(1);
            $table->unsignedSmallInteger('max_products')->default(50);  // 0 = unlimited
            $table->json('features');                  // Array of feature strings for landing page
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed the 3 default plans
        DB::table('plans')->insert([
            [
                'name'         => 'Starter',
                'slug'         => 'starter',
                'price_kobo'   => 500000,   // ₦5,000/month
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
                'sort_order'   => 1,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'name'         => 'Business',
                'slug'         => 'business',
                'price_kobo'   => 1500000,  // ₦15,000/month
                'max_users'    => 5,
                'max_products' => 0,        // unlimited
                'features'     => json_encode([
                    'Up to 5 user accounts',
                    'Unlimited products',
                    'Full analytics & profit/loss',
                    'Customer credit management',
                    'CSV export & print reports',
                    'Email notifications',
                ]),
                'is_active'    => true,
                'sort_order'   => 2,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'name'         => 'Enterprise',
                'slug'         => 'enterprise',
                'price_kobo'   => 3500000,  // ₦35,000/month
                'max_users'    => 0,        // unlimited
                'max_products' => 0,        // unlimited
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
                'sort_order'   => 3,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);

        // Add foreign key constraint from tenants to plans
        Schema::table('tenants', function (Blueprint $table) {
            $table->foreign('plan_id')->references('id')->on('plans')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
