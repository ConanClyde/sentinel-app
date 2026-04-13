<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add rejection_reason column
        Schema::table('vehicle_violations', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('remarks');
        });

        // Map existing statuses to new values
        DB::table('vehicle_violations')
            ->where('status', 'assigned')
            ->update(['status' => 'approved']);

        DB::table('vehicle_violations')
            ->where('status', 'dismissed')
            ->update(['status' => 'rejected']);

        // Change from ENUM to VARCHAR for better PHP enum compatibility
        DB::statement("ALTER TABLE vehicle_violations MODIFY COLUMN status VARCHAR(20) DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert status values
        DB::table('vehicle_violations')
            ->where('status', 'approved')
            ->update(['status' => 'assigned']);

        DB::table('vehicle_violations')
            ->where('status', 'rejected')
            ->update(['status' => 'dismissed']);

        // Revert to ENUM
        DB::statement("ALTER TABLE vehicle_violations MODIFY COLUMN status ENUM('pending', 'assigned', 'resolved', 'dismissed') DEFAULT 'pending'");

        // Drop rejection_reason column
        Schema::table('vehicle_violations', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });
    }
};
