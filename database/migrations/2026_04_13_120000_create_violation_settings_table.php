<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('violation_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('default_department_id')->nullable()->constrained('role_types')->nullOnDelete();
            $table->foreignId('student_department_id')->nullable()->constrained('role_types')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('violation_settings');
    }
};
