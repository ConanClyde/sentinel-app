<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\PendingRegistration;
use App\Models\StickerColor;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleType;
use Illuminate\Support\Str;

class StickerService
{
    public function calculateStickerColor(User|PendingRegistration $entity): StickerColor
    {
        $role = $entity instanceof User ? $entity->role : $entity->getMainRoleAttribute();
        $plateNumber = null;

        if ($entity instanceof User && $entity->vehicles()->exists()) {
            $plateNumber = $entity->vehicles()->first()?->plate_number;
        }

        // Staff/Security -> Maroon
        if ($role === UserRole::STAFF || $role === UserRole::SECURITY) {
            return StickerColor::where('name', 'Maroon')->firstOrFail();
        }

        // Stakeholder -> White
        if ($role === UserRole::STAKEHOLDER) {
            return StickerColor::where('name', 'White')->firstOrFail();
        }

        // Student - based on plate number
        if ($role === UserRole::STUDENT) {
            // No plate (Electric Vehicle) -> White
            if (empty($plateNumber)) {
                return StickerColor::where('name', 'White')->firstOrFail();
            }

            $lastDigit = (int) substr(trim($plateNumber), -1);

            return match ($lastDigit) {
                1, 2 => StickerColor::where('name', 'Blue')->firstOrFail(),
                3, 4 => StickerColor::where('name', 'Green')->firstOrFail(),
                5, 6 => StickerColor::where('name', 'Yellow')->firstOrFail(),
                7, 8 => StickerColor::where('name', 'Pink')->firstOrFail(),
                9, 0 => StickerColor::where('name', 'Orange')->firstOrFail(),
            };
        }

        // Default to White for other roles
        return StickerColor::where('name', 'White')->firstOrFail();
    }

    public function generateStickerNumber(): string
    {
        $year = date('Y');
        $lastVehicle = Vehicle::orderBy('id', 'desc')->first();
        $sequence = $lastVehicle ? $lastVehicle->id + 1 : 1;

        return sprintf('YR-%d-%06d', $year, $sequence);
    }

    public function createVehicleFromPending(PendingRegistration $pending, array $vehicleData): Vehicle
    {
        $vehicleType = VehicleType::where('name', $vehicleData['vehicle_type'])->firstOrFail();
        $stickerColor = $this->calculateStickerColor($pending);

        return Vehicle::create([
            'user_id' => null, // Will be set after user is created
            'vehicle_type_id' => $vehicleType->id,
            'plate_number' => $vehicleData['plate_number'] ?? null,
            'sticker_number' => $this->generateStickerNumber(),
            'sticker_color_id' => $stickerColor->id,
            'qr_code_path' => null, // Generated after user is created
            'is_active' => false,
        ]);
    }

    public function generateQRCode(Vehicle $vehicle, User $user): string
    {
        $data = [
            'sticker_number' => $vehicle->sticker_number,
            'user' => [
                'name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role?->label(),
            ],
            'vehicle' => [
                'type' => $vehicle->vehicleType?->name,
                'plate_number' => $vehicle->plate_number,
            ],
            'color' => $vehicle->stickerColor?->name,
            'generated_at' => now()->toIso8601String(),
        ];

        $jsonData = json_encode($data);
        $filename = 'stickers/' . $vehicle->sticker_number . '_' . Str::random(8) . '.svg';

        // Generate QR code as data URL (simple implementation)
        // In production, use a proper QR library like simple-qrcode
        $qrData = base64_encode($jsonData);

        return $filename;
    }

    public function activateVehicle(Vehicle $vehicle, User $user): Vehicle
    {
        $vehicle->user_id = $user->id;
        $vehicle->qr_code_path = $this->generateQRCode($vehicle, $user);
        $vehicle->is_active = true;
        $vehicle->save();

        return $vehicle;
    }
}
