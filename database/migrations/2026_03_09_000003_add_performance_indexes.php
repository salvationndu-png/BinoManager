<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->index('sale_date', 'idx_sales_date');
            $table->index('product_id', 'idx_sales_product');
            $table->index('user_id', 'idx_sales_user');
            $table->index('customer_id', 'idx_sales_customer');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->index('product_id', 'idx_stocks_product');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex('idx_sales_date');
            $table->dropIndex('idx_sales_product');
            $table->dropIndex('idx_sales_user');
            $table->dropIndex('idx_sales_customer');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->dropIndex('idx_stocks_product');
        });
    }
};
