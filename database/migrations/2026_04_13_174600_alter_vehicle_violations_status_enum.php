<?php

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
        Schema::table('vehicle_violations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected', 'resolved'])->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_violations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'assigned', 'resolved', 'dismissed'])->default('pending')->change();
        });
    }
};
