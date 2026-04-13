<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drops the old vehicle_violations table and rebuilds it with the correct schema.
     */
    public function up(): void
    {
        Schema::dropIfExists('vehicle_violations');

        Schema::create('vehicle_violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reported_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('violator_vehicle_id')->constrained('vehicles')->onDelete('cascade');
            $table->string('violator_sticker_number')->nullable();
            $table->foreignId('violation_type_id')->constrained('violation_types')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->decimal('pin_x', 10, 7)->nullable(); // GPS / map coordinate
            $table->decimal('pin_y', 10, 7)->nullable(); // GPS / map coordinate
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->string('assigned_to_user_type')->nullable();
            $table->enum('status', ['pending', 'assigned', 'resolved', 'dismissed'])->default('pending');
            $table->timestamp('reported_at')->nullable();
            $table->string('evidence_image')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('status_updated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_violations');
    }
};
