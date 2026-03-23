<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->timestamp('last_active_at')->nullable()->after('paystack_customer_code');
            $table->text('internal_notes')->nullable()->after('last_active_at'); // super admin notes
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['last_active_at', 'internal_notes']);
        });
    }
};
