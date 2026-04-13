<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('surname');
            $table->string('name_extension')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->nullable();
            $table->foreignId('role_type_id')->nullable()->constrained('role_types')->onDelete('set null');

            // College and Program (Student)
            $table->foreignId('college_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');

            // Student specific
            $table->string('student_id')->nullable();
            $table->string('student_id_image')->nullable();

            // Staff specific
            $table->string('staff_id')->nullable();
            $table->string('staff_id_image')->nullable();

            // Stakeholder specific
            $table->string('stakeholder_type')->nullable();
            $table->string('student_school_id_image')->nullable();

            // Common optional
            $table->string('license_number')->nullable();
            $table->string('license_image')->nullable();
            $table->string('face_scan_data')->nullable();

            // Email verification
            $table->boolean('email_verified')->default(false);
            $table->string('verification_code', 6)->nullable();
            $table->timestamp('verification_code_expires_at')->nullable();

            // Status and approval
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_registrations');
    }
};
