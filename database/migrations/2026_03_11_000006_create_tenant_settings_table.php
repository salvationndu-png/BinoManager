<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained('tenants')->cascadeOnDelete();

            // Branding
            $table->string('business_name')->nullable();
            $table->string('logo_path')->nullable();       // relative path in storage
            $table->string('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('receipt_footer')->nullable();  // shown on printed receipts

            // Regional
            $table->string('timezone', 50)->default('Africa/Lagos');
            $table->string('currency_symbol', 5)->default('₦');

            // Operational
            $table->unsignedSmallInteger('low_stock_threshold')->default(10);

            // Notification toggles (stored as booleans)
            $table->boolean('notify_low_stock')->default(true);
            $table->boolean('notify_daily_summary')->default(true);
            $table->boolean('notify_credit_reminder')->default(true);

            // Onboarding
            $table->timestamp('onboarding_completed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_settings');
    }
};
