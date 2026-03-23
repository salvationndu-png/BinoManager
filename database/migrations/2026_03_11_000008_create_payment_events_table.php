<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stores every processed Paystack webhook event.
     * Prevents double-processing when Paystack retries delivery.
     */
    public function up(): void
    {
        Schema::create('payment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();

            $table->string('paystack_event_id')->unique(); // e.g. "evt_xyz" — idempotency key
            $table->string('event_type');                  // "charge.success", "subscription.disable" etc.
            $table->json('payload');                       // full raw payload for audit
            $table->enum('status', ['processed', 'ignored', 'failed'])->default('processed');
            $table->string('error_message')->nullable();

            $table->timestamp('processed_at');
            $table->timestamps();

            $table->index(['tenant_id', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_events');
    }
};
