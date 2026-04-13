<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('department_privilege', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_type_id')->constrained('role_types')->onDelete('cascade');
            $table->foreignId('privilege_id')->constrained('privileges')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['role_type_id', 'privilege_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('department_privilege');
    }
};
