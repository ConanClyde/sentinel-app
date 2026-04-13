<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StickerRequest extends Model
{
    protected $fillable = ['user_id', 'vehicle_id', 'type', 'reason', 'status', 'notes', 'fee_amount', 'receipt_number', 'paid_at', 'payment_method'];

    protected $casts = [
        'paid_at' => 'datetime',
        'fee_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
