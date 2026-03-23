<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Super admins are stored in a COMPLETELY SEPARATE table from tenant users.
     * This is intentional:
     *   - A tenant admin cannot ever escalate to super admin (different guard)
     *   - No tenant_id scoping needed — these are platform-level accounts
     *   - The separation makes auditing clean and unambiguous
     */
    public function up(): void
    {
        Schema::create('super_admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Seed a default super admin using the env values
        // Password MUST be changed after first login
        DB::table('super_admins')->insert([
            'name'       => '404Softwares Admin',
            'email'      => env('SUPER_ADMIN_EMAIL', 'admin@wholesalemanager.com'),
            'password'   => Hash::make(env('SUPER_ADMIN_PASSWORD', 'ChangeMe#2026!')),
            'is_active'  => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('super_admins');
    }
};
