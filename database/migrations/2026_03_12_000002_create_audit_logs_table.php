<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Audit log for all super admin actions.
     * Immutable — rows are never updated or deleted.
     * Covers: logins, tenant management, impersonation, plan changes.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Who did it
            $table->foreignId('super_admin_id')->nullable()->constrained('super_admins')->nullOnDelete();

            // What tenant it affected (nullable — some actions are platform-level)
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();

            // What happened
            $table->string('action');           // e.g. "tenant.suspend", "impersonate.start"
            $table->text('description');        // human-readable: "Suspended tenant Aba Traders"
            $table->json('context')->nullable(); // arbitrary extra data (old/new values, etc.)

            // Request context for forensics
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Indexes for filtering
            $table->index(['super_admin_id', 'created_at']);
            $table->index(['tenant_id', 'created_at']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
