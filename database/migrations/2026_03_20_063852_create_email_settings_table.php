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
        Schema::create('email_settings', function (Blueprint $table) {
            $table->id();
            $table->string('driver')->default('smtp'); // smtp, sendmail, mailgun, ses, etc.
            $table->string('host')->nullable();
            $table->integer('port')->nullable();
            $table->string('encryption')->nullable(); // tls, ssl, null
            $table->string('username')->nullable();
            $table->text('password')->nullable(); // encrypted
            $table->string('from_address')->nullable();
            $table->string('from_name')->nullable();
            
            // Additional settings for other drivers
            $table->string('mailgun_domain')->nullable();
            $table->string('mailgun_secret')->nullable();
            $table->string('mailgun_endpoint')->default('api.mailgun.net');
            
            $table->text('ses_key')->nullable(); // encrypted
            $table->text('ses_secret')->nullable(); // encrypted
            $table->string('ses_region')->default('us-east-1');
            
            // Status and testing
            $table->boolean('is_active')->default(false);
            $table->timestamp('last_tested_at')->nullable();
            $table->text('test_result')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_settings');
    }
};
