<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add tenant_id to every core business-data table.
     * Security note: tenant_id is NEVER populated from user input —
     * it is always set programmatically from the resolved tenant context.
     */
    public function up(): void
    {
        $tables = ['products', 'stocks', 'sales', 'customers'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->foreignId('tenant_id')
                      ->nullable()
                      ->after('id')
                      ->constrained('tenants')
                      ->cascadeOnDelete(); // When tenant deleted, data deleted with them

                $table->index('tenant_id');
            });
        }
    }

    public function down(): void
    {
        $tables = ['products', 'stocks', 'sales', 'customers'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropForeign(['tenant_id']);
                $table->dropIndex(['tenant_id']);
                $table->dropColumn('tenant_id');
            });
        }
    }
};
