<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Paystack, Stripe, Flutterwave
            $table->string('slug')->unique(); // paystack, stripe, flutterwave
            $table->boolean('is_active')->default(false);
            $table->text('public_key')->nullable();
            $table->text('secret_key')->nullable();
            $table->string('webhook_secret')->nullable();
            $table->string('currency', 3)->default('NGN'); // NGN, USD, etc
            $table->json('config')->nullable(); // Additional gateway-specific settings
            $table->timestamps();
        });

        // Seed default gateways
        DB::table('payment_gateways')->insert([
            [
                'name' => 'Paystack',
                'slug' => 'paystack',
                'is_active' => true,
                'public_key' => null,
                'secret_key' => null,
                'webhook_secret' => null,
                'currency' => 'NGN',
                'config' => json_encode(['api_url' => 'https://api.paystack.co']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Stripe',
                'slug' => 'stripe',
                'is_active' => false,
                'public_key' => null,
                'secret_key' => null,
                'webhook_secret' => null,
                'currency' => 'USD',
                'config' => json_encode(['api_url' => 'https://api.stripe.com']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Flutterwave',
                'slug' => 'flutterwave',
                'is_active' => false,
                'public_key' => null,
                'secret_key' => null,
                'webhook_secret' => null,
                'currency' => 'NGN',
                'config' => json_encode(['api_url' => 'https://api.flutterwave.com']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('payment_gateways');
    }
};
