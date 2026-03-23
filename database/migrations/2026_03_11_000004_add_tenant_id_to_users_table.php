<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Placed after 'id', before 'name' in conceptual ordering
            // nullable so the first admin (tenant owner) can be seeded before tenant exists
            $table->foreignId('tenant_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('tenants')
                  ->nullOnDelete();

            $table->index('tenant_id');
        });

        // Migrate all existing users to tenant_id = 1 (the bootstrap tenant)
        // This will be set after the tenants seeder runs in a separate command.
        // Left as null here — the InstallSaaS command handles backfill.
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropIndex(['tenant_id']);
            $table->dropColumn('tenant_id');
        });
    }
};
