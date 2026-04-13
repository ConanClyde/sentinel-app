<?php

use App\Enums\NameExtension;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('surname');
            $table->enum('name_extension', NameExtension::values())->nullable();
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->nullable();

            // Role Relationship (Now optional for sub-types)
            $table->foreignId('role_type_id')->nullable()->constrained('role_types')->onDelete('set null');

            // Student specific
            $table->unsignedBigInteger('college_id')->nullable();
            $table->unsignedBigInteger('program_id')->nullable();
            $table->string('student_id')->nullable();
            $table->string('student_id_image')->nullable();

            // Staff specific
            $table->string('staff_id')->nullable();
            $table->string('staff_id_image')->nullable();

            // Stakeholder specific
            $table->string('stakeholder_type')->nullable();

            // Common optional fields
            $table->string('license_number')->nullable();
            $table->string('license_image')->nullable();
            $table->string('face_scan_data')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
