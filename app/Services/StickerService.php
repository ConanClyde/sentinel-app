<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\PendingRegistration;
use App\Models\StickerColor;
use App\Models\StickerCounter;
use App\Models\StickerRule;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\CarbonInterface;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QRMarkupSVG;
use chillerlan\QRCode\QRCode;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StickerService
{
    /**
     * Determine sticker color based on user type and plate number using DB rules
     */
    public function calculateStickerColor(User|PendingRegistration $entity, ?string $overridePlate = null): StickerColor
    {
        $rules = StickerRule::getSingleton();
        $role = $entity instanceof User ? $entity->role : $entity->getMainRoleAttribute();

        if ($overridePlate !== null) {
            $plateNumber = $overridePlate;
        } elseif ($entity instanceof User) {
            $plateNumber = $entity->vehicles()->first()?->plate_number;
        } else {
            $plateNumber = $entity->vehicles()->first()?->plate_number;
        }

        $colorName = 'White'; // Default

        if ($role === UserRole::SECURITY_PERSONNEL) {
            $colorName = $rules->security_color ?? 'Maroon';
        } elseif ($role === UserRole::STAFF) {
            $colorName = $rules->staff_color ?? 'Maroon';
        } elseif ($role === UserRole::STAKEHOLDER) {
            $stakeholderType = $entity->stakeholder_type;
            $map = is_array($rules->stakeholder_map) ? $rules->stakeholder_map : [];
            $colorName = $map[$stakeholderType] ?? 'White';
        } elseif ($role === UserRole::STUDENT) {
            $map = is_array($rules->student_map) ? $rules->student_map : [];
            if (empty($plateNumber)) {
                $colorName = $map['no_plate'] ?? 'White';
            } else {
                // Extract only numeric digits from the end of plate number
                // e.g., "123ABD" -> "3", "ABC-5678" -> "8"
                $trimmed = trim($plateNumber);
                $lastDigit = '';
                for ($i = strlen($trimmed) - 1; $i >= 0; $i--) {
                    $char = $trimmed[$i];
                    if (is_numeric($char)) {
                        $lastDigit = $char;
                        break;
                    }
                }

                // Find matching digit pair in the map keys (e.g. "12", "34")
                if ($lastDigit !== '') {
                    foreach ($map as $digits => $color) {
                        if ($digits !== 'no_plate' && str_contains($digits, $lastDigit)) {
                            $colorName = $color;
                            break;
                        }
                    }
                }
            }
        }

        return StickerColor::where('name', $colorName)->first() ?? StickerColor::where('name', 'White')->firstOrFail();
    }

    /**
     * Calculate expiration date based on role specific rules
     */
    public function calculateExpirationDate(User|PendingRegistration $entity): CarbonInterface
    {
        $rules = StickerRule::getSingleton();
        $role = $entity instanceof User ? $entity->role : $entity->getMainRoleAttribute();

        $years = 4; // Default if something goes wrong

        if ($role === UserRole::STUDENT) {
            $years = $rules->student_expiration_years;
        } elseif ($role === UserRole::STAFF) {
            $years = $rules->staff_expiration_years;
        } elseif ($role === UserRole::SECURITY_PERSONNEL) {
            $years = $rules->security_expiration_years;
        } elseif ($role === UserRole::STAKEHOLDER) {
            $years = $rules->stakeholder_expiration_years;
        }

        return now()->addYears($years);
    }

    /**
     * Generate next sticker number for a given color using counters
     * Uses row locking to prevent race conditions
     */
    public function generateStickerNumber(StickerColor $color): string
    {
        return DB::transaction(function () use ($color) {
            // Lock the counter row to prevent race conditions
            $counter = StickerCounter::lockForUpdate()
                ->firstOrCreate(
                    ['color' => $color->name],
                    ['count' => 0]
                );

            // Simply increment counter - no need to check existing vehicles
            // The counter is the source of truth, gap filling adds unnecessary complexity
            $nextNumber = $counter->count + 1;

            $counter->update(['count' => $nextNumber]);

            // Store with color prefix for global uniqueness (e.g., BLUE-0001)
            $stickerNo = strtoupper($color->name).'-'.$this->formatDigitPart($nextNumber);

            \Illuminate\Support\Facades\Log::info('New sticker number generated', [
                'color' => $color->name,
                'number' => $stickerNo
            ]);

            return $stickerNo;

        });
    }

    /**
     * Format the numeric part as 4-digit zero-padded string
     */
    protected function formatDigitPart(int $number): string
    {
        return str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Extract the numeric part from a full sticker number (e.g., BLUE-0001 -> 1)
     */
    protected function extractNumericPart(string $stickerNumber): ?int
    {
        if (strpos($stickerNumber, '-') !== false) {
            $parts = explode('-', $stickerNumber);
            $numeric = end($parts);

            return (int) ltrim($numeric, '0') ?: 0;
        }

        return (int) ltrim($stickerNumber, '0') ?: 0;
    }

    /**
     * Extract the display number (4-digit part only) for printed stickers
     * e.g., BLUE-0001 -> 0001
     */
    public function extractDisplayNumber(string $stickerNumber): string
    {
        if (strpos($stickerNumber, '-') !== false) {
            $parts = explode('-', $stickerNumber);

            return end($parts) ?: $stickerNumber;
        }

        return $stickerNumber;
    }

    /**
     * Generate the actual SVG sticker with QR code
     */
    public function generateSticker(Vehicle $vehicle, User $user): string
    {
        \Illuminate\Support\Facades\Log::info('Generating high-resolution SVG sticker', [
            'vehicle_id' => $vehicle->id,
            'sticker_number' => $vehicle->sticker_number,
            'owner' => $user->full_name
        ]);

        try {

            $color = $vehicle->stickerColor;
            $bgHex = $this->getHexColor($color);
            $textColor = (strtolower($color->name) === 'white' || $bgHex === '#FFFFFF') ? '#000000' : '#FFFFFF';

            // QR Data: Encode the plate number directly for instant identification
            $qrData = $vehicle->plate_number;

            // Generate QR code - match old project options exactly
            $qrSvg = (new QRCode([
                'version' => 5,
                'outputInterface' => QRMarkupSVG::class,
                'eccLevel' => EccLevel::L,
                'scale' => 8,
                'imageBase64' => false,
                'svgDefs' => '',
            ]))->render($qrData);

            // Library may return base64 data URI, decode it
            if (str_starts_with($qrSvg, 'data:image/svg+xml;base64,')) {
                $base64 = substr($qrSvg, strlen('data:image/svg+xml;base64,'));
                $qrSvg = base64_decode($base64);
            }

            // Constants
            $width = 600;
            $height = 900;
            $qrSize = 520;
            $qrPadding = 12; // Reduced padding for larger QR
            $radius = 40;
            $innerSize = $qrSize - 2 * $qrPadding;

            // Calculate scale
            $scale = $this->calculateQrScale($qrSvg, $innerSize);

            // Extract display number
            $displayNo = $this->extractDisplayNumber($vehicle->sticker_number);

            // Build SVG directly (match old project)
            $svg = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n".
                   "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{$width}\" height=\"{$height}\" viewBox=\"0 0 {$width} {$height}\">".
                   "<rect width=\"100%\" height=\"100%\" fill=\"{$bgHex}\"/>".
                   '<rect x="'.(($width - $qrSize) / 2)."\" y=\"60\" width=\"{$qrSize}\" height=\"{$qrSize}\" rx=\"{$radius}\" ry=\"{$radius}\" fill=\"#FFFFFF\" ".($color->name === 'white' ? 'stroke="#000" stroke-width="6"' : '').'/>'.
                   '<g transform="translate('.(($width - $qrSize) / 2 + $qrPadding).','.(60 + $qrPadding).") scale({$scale})\">".
                       preg_replace('/^.*?<svg[^>]*>|<\/svg>.*$/s', '', $qrSvg).
                   '</g>'.
                   '<text x="50%" y="'.(60 + $qrSize + 90)."\" fill=\"{$textColor}\" font-size=\"64\" font-family=\"Arial, sans-serif\" font-weight=\"700\" text-anchor=\"middle\">MLUC SENTINEL</text>".
                   '<text x="50%" y="'.($height - 60)."\" fill=\"{$textColor}\" font-size=\"190\" font-family=\"Arial Black, Arial, sans-serif\" text-anchor=\"middle\">".htmlspecialchars($displayNo, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8').'</text>'.
                   '</svg>';

            $sanitizedSurname = preg_replace('/[^A-Za-z0-9]+/', '', strtolower($user->surname));
            $sanitizedFirst = preg_replace('/[^A-Za-z0-9]+/', '', strtolower($user->first_name));
            $fileName = 'stickers/users/'.$user->id.'/'.strtolower($color->name).'_'.$displayNo.'_'.$sanitizedSurname.'_'.$sanitizedFirst.'.svg';

            Storage::disk('private')->put($fileName, $svg);

            \Illuminate\Support\Facades\Log::info('SVG sticker successfully saved', [
                'vehicle_id' => $vehicle->id,
                'path' => $fileName
            ]);

            return $fileName;

        } catch (\Exception $e) {
            logger()->error('Sticker generation failed: '.$e->getMessage());
            throw $e;
        }
    }

    protected function calculateQrScale(string $qrSvg, int $innerSize): float
    {
        $baseSize = 0;
        if (preg_match('/viewBox="\s*0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*"/i', $qrSvg, $m)) {
            $baseSize = (float) min($m[1], $m[2]);
        } elseif (preg_match('/width="(\d+(?:\.\d+)?)"[^>]*height="(\d+(?:\.\d+)?)"/i', $qrSvg, $m)) {
            $baseSize = (float) min($m[1], $m[2]);
        }
        if ($baseSize <= 0) {
            $baseSize = 256.0;
        }

        return $innerSize / $baseSize;
    }

    protected function getHexColor(StickerColor $color): string
    {
        $rules = StickerRule::getSingleton();
        $palette = is_array($rules->palette) ? $rules->palette : [];

        if (isset($palette[$color->name])) {
            return $palette[$color->name];
        }

        // Fallback to the color's own hex_code
        if ($color->hex_code) {
            return $color->hex_code;
        }

        // Last resort: use first available palette color
        $first = reset($palette);
        if ($first !== false) {
            return $first;
        }

        return '#FFFFFF';
    }

    public function activateVehicle(Vehicle $vehicle, User $user): Vehicle
    {
        return DB::transaction(function () use ($vehicle, $user) {
            $vehicle->user_id = $user->id;
            $vehicle->expires_at = $this->calculateExpirationDate($user);
            $vehicle->qr_code_path = $this->generateSticker($vehicle, $user);
            $vehicle->is_active = true;
            $vehicle->save();

            return $vehicle;
        });
    }
}
