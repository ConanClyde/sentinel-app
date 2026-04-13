<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StickerFee extends Model
{
    protected $fillable = [
        'name',
        'type',
        'amount',
        'description',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public static function getByType(string $type): ?self
    {
        return static::where('type', $type)->where('is_active', true)->first();
    }

    public static function getAllActive(): \Illuminate\Database\Eloquent\Collection
    {
        return static::where('is_active', true)->orderBy('name')->get();
    }
}
