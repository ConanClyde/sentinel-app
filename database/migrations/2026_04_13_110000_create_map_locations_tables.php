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
        Schema::create('map_location_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('default_color', 7); // Hex color
            $table->string('icon', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('map_locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_code', 20)->unique();
            $table->text('description')->nullable();
            $table->foreignId('type_id')->constrained('map_location_types')->onDelete('cascade');
            $table->json('vertices'); // Array of {x: number, y: number}
            $table->float('center_x'); // Percentage coordinate 0-100
            $table->float('center_y'); // Percentage coordinate 0-100
            $table->string('color', 7)->nullable(); // Override color
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('map_locations');
        Schema::dropIfExists('map_location_types');
    }
};
