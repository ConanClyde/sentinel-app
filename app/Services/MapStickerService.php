<?php

namespace App\Services;

use App\Models\MapLocation;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QRMarkupSVG;
use chillerlan\QRCode\QRCode;
use Illuminate\Support\Facades\Storage;

class MapStickerService
{
    /**
     * Generate a printable SVG patrol sticker for the given location.
     * Returns the storage path (relative to the public disk).
     */
    public function generate(MapLocation $location): string
    {
        // QR Data: Short Code (Matches Vehicle Plate pattern)
        $qrUrl = (string) $location->short_code;

        // Generate QR code SVG
        $qrSvg = (new QRCode([
            'version' => 5,
            'outputInterface' => QRMarkupSVG::class,
            'eccLevel' => EccLevel::L,
            'scale' => 8,
            'imageBase64' => false,
            'svgDefs' => '',
        ]))->render($qrUrl);

        // Decode base64 if library returned a data URI
        if (str_starts_with($qrSvg, 'data:image/svg+xml;base64,')) {
            $qrSvg = base64_decode(substr($qrSvg, strlen('data:image/svg+xml;base64,')));
        }

        // Match vehicle sticker constants
        $width = 600;
        $height = 900;
        $qrSize = 520;
        $qrPadding = 12;
        $radius = 40;
        $innerSize = $qrSize - 2 * $qrPadding;
        $qrTop = 60;
        $qrLeft = ($width - $qrSize) / 2;

        // Color from location (fallback to neutral)
        $bgColor = $location->color ?? '#1e293b';
        $textColor = $this->contrastColor($bgColor);

        // Scale QR to fit inner box
        $scale = $this->calculateQrScale($qrSvg, $innerSize);

        // Strip outer <svg> tags
        $qrInner = preg_replace('/^.*?<svg[^>]*>|<\/svg>.*$/s', '', $qrSvg);

        $shortCode = htmlspecialchars($location->short_code, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $svg = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n".
               "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{$width}\" height=\"{$height}\" viewBox=\"0 0 {$width} {$height}\">".
               "<rect width=\"100%\" height=\"100%\" fill=\"{$bgColor}\"/>".
               "<rect x=\"{$qrLeft}\" y=\"{$qrTop}\" width=\"{$qrSize}\" height=\"{$qrSize}\" rx=\"{$radius}\" ry=\"{$radius}\" fill=\"#FFFFFF\"".(strtolower($bgColor) === '#ffffff' ? ' stroke="#000" stroke-width="6"' : '').'/>'.
               '<g transform="translate('.($qrLeft + $qrPadding).','.($qrTop + $qrPadding).") scale({$scale})\">".
                   $qrInner.
               '</g>'.
               '<text x="50%" y="'.($qrTop + $qrSize + 90)."\" fill=\"{$textColor}\" font-size=\"64\" font-family=\"Arial, sans-serif\" font-weight=\"700\" text-anchor=\"middle\">MLUC SENTINEL</text>".
               '<text x="50%" y="'.($height - 60)."\" fill=\"{$textColor}\" font-size=\"160\" font-family=\"Arial Black, Arial, sans-serif\" text-anchor=\"middle\">{$shortCode}</text>".
               '</svg>';

        $filename = $this->buildFilename($location);
        $storagePath = 'stickers/map/'.$filename;

        Storage::disk('public')->put($storagePath, $svg);

        return $storagePath;
    }

    /**
     * Delete the sticker file for a location (if it has one).
     */
    public function delete(MapLocation $location): void
    {
        if ($location->sticker_path && Storage::disk('public')->exists($location->sticker_path)) {
            Storage::disk('public')->delete($location->sticker_path);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function buildFilename(MapLocation $location): string
    {
        $color = ltrim($location->color ?? '1e293b', '#');
        $code = preg_replace('/[^A-Za-z0-9_-]/', '', $location->short_code);
        $id = $location->id;

        return "{$color}_{$code}_{$id}.svg";
    }

    private function calculateQrScale(string $qrSvg, int $innerSize): float
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

    /**
     * Return black or white depending on which has more contrast against $hex.
     */
    private function contrastColor(string $hex): string
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        // Relative luminance (WCAG formula)
        $luminance = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255;

        return $luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
}
