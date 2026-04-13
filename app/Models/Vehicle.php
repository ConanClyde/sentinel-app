<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'user_id',
        'vehicle_type_id',
        'plate_number',
        'sticker_number',
        'sticker_color_id',
        'qr_code_path',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class);
    }

    public function stickerColor(): BelongsTo
    {
        return $this->belongsTo(StickerColor::class);
    }

    /**
     * Get the violations for this vehicle.
     */
    public function violations(): HasMany
    {
        return $this->hasMany(VehicleViolation::class);
    }
}
