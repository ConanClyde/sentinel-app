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
        Schema::create('patrol_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('security_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('map_location_id')->constrained('map_locations')->onDelete('cascade');
            $table->dateTime('checked_in_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes for query performance
            $table->index('security_user_id');
            $table->index('map_location_id');
            $table->index('checked_in_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patrol_logs');
    }
};
