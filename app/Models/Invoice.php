<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'user_id',
        'vehicle_id',
        'invoice_number',
        'type',
        'amount',
        'description',
        'status',
        'payment_method',
        'paid_at',
        'created_by',
        'received_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-'.date('Ymd');
        $lastInvoice = static::where('invoice_number', 'like', $prefix.'%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix.'-'.str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public static function createForRegistration(User $user, Vehicle $vehicle, string $type, float $amount, ?int $creatorId = null): self
    {
        return static::create([
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'invoice_number' => static::generateInvoiceNumber(),
            'type' => $type,
            'amount' => $amount,
            'description' => self::getDescription($type, $vehicle),
            'status' => 'pending',
            'created_by' => $creatorId,
        ]);
    }

    private static function getDescription(string $type, Vehicle $vehicle): string
    {
        return match ($type) {
            'new_registration' => "Sticker for {$vehicle->plate_number} ({$vehicle->vehicleType?->name})",
            'renewal' => "Sticker renewal for {$vehicle->plate_number}",
            'replacement' => "Sticker replacement for {$vehicle->plate_number}",
            default => "Sticker fee",
        };
    }
}
