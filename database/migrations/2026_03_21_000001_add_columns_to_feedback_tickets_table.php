<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feedback_tickets', function (Blueprint $table) {
            $table->foreignId('tenant_id')->after('id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->after('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('support')->after('user_id');
            $table->string('subject')->after('type');
            $table->text('message')->after('subject');
            $table->enum('status', ['open', 'in_progress', 'closed'])->default('open')->after('message');
            $table->text('admin_reply')->nullable()->after('status');
            $table->timestamp('replied_at')->nullable()->after('admin_reply');
        });
    }

    public function down(): void
    {
        Schema::table('feedback_tickets', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['user_id']);
            $table->dropColumn(['tenant_id','user_id','type','subject','message','status','admin_reply','replied_at']);
        });
    }
};
