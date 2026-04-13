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
        Schema::create('sticker_rules', function (Blueprint $table) {
            $table->id();
            $table->integer('student_expiration_years')->default(4);
            $table->integer('staff_expiration_years')->default(4);
            $table->integer('security_expiration_years')->default(4);
            $table->integer('stakeholder_expiration_years')->default(1);
            $table->string('staff_color')->default('Maroon');
            $table->string('security_color')->default('Maroon');
            $table->json('student_map')->nullable();
            $table->json('stakeholder_map')->nullable();
            $table->json('palette')->nullable(); // For HEX code lookups if not using sticker_colors table
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sticker_rules');
    }
};
