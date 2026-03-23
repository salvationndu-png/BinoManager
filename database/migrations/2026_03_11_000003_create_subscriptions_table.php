<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans');

            // Paystack recurring billing references
            $table->string('paystack_subscription_code')->nullable()->unique();
            $table->string('paystack_email_token')->nullable();   // used to manage subscription

            // Lifecycle
            $table->enum('status', ['active', 'cancelled', 'non-renewing'])->default('active');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();        // null = open-ended recurring
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('next_payment_date')->nullable();

            // Amount actually charged (may differ from plan if promo applied)
            $table->unsignedBigInteger('amount_kobo');

            $table->timestamps();

            $table->index('tenant_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
