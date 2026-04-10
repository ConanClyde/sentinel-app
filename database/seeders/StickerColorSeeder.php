<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StickerColorSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['name' => 'Maroon', 'hex_code' => '#800000'],
            ['name' => 'Green', 'hex_code' => '#228B22'],
            ['name' => 'Yellow', 'hex_code' => '#FFD700'],
            ['name' => 'Pink', 'hex_code' => '#FF69B4'],
            ['name' => 'Orange', 'hex_code' => '#FF8C00'],
            ['name' => 'Blue', 'hex_code' => '#1E90FF'],
            ['name' => 'White', 'hex_code' => '#FFFFFF'],
        ];

        foreach ($colors as $color) {
            DB::table('sticker_colors')->updateOrInsert(
                ['name' => $color['name']],
                $color + ['created_at' => now()]
            );
        }
    }
}
