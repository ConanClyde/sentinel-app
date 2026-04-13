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
        Schema::create('sticker_fees', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Sticker Replacement", "Sticker Renewal"
            $table->string('type'); // 'replacement' or 'renewal'
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Add fee and receipt fields to sticker_requests table
        Schema::table('sticker_requests', function (Blueprint $table) {
            $table->decimal('fee_amount', 10, 2)->nullable()->after('notes');
            $table->string('receipt_number')->nullable()->after('fee_amount');
            $table->datetime('paid_at')->nullable()->after('receipt_number');
            $table->string('payment_method')->nullable()->after('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sticker_fees');
    }
};
