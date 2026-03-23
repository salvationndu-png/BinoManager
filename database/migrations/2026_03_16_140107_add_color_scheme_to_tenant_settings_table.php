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
        Schema::table('tenant_settings', function (Blueprint $table) {
            $table->string('primary_color', 7)->default('#2563eb')->after('receipt_footer');
            $table->string('secondary_color', 7)->default('#1e40af')->after('primary_color');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tenant_settings', function (Blueprint $table) {
            $table->dropColumn(['primary_color', 'secondary_color']);
        });
    }
};
