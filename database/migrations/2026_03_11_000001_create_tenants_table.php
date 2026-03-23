<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();

            // Identity
            $table->string('name');                              // "Aba Traders Ltd"
            $table->string('slug')->unique();                    // "aba-traders" → subdomain
            $table->string('email')->unique();                   // owner contact
            $table->string('phone', 20)->nullable();

            // Plan & billing
            $table->unsignedBigInteger('plan_id')->nullable();
            $table->enum('status', ['trialing', 'active', 'grace', 'suspended', 'cancelled'])
                  ->default('trialing');

            // Trial window
            $table->timestamp('trial_ends_at')->nullable();

            // Grace period (failed payment window)
            $table->timestamp('grace_ends_at')->nullable();

            // Paystack reference
            $table->string('paystack_customer_code')->nullable();

            // Soft-delete (we never hard-delete tenants — audit trail)
            $table->softDeletes();
            $table->timestamps();

            // Indexing for middleware performance
            $table->index('slug');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
