<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('invited_by')->constrained('users')->cascadeOnDelete();

            $table->string('email');
            $table->enum('role', ['admin', 'salesperson'])->default('salesperson');

            // Secure random token — 64 hex chars
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();

            $table->timestamps();

            // Prevent duplicate pending invites for same email on same tenant
            $table->unique(['tenant_id', 'email']);
            $table->index(['token']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_invitations');
    }
};
