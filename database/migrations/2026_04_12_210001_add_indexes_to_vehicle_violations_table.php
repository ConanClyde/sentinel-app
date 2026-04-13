<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_violations', function (Blueprint $table) {
            $table->index('status');
            $table->index('reported_at');
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_violations', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['reported_at']);
        });
    }
};
