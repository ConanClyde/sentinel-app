<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MapLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Parking Area',
                'default_color' => '#2563eb', // Blue
                'icon' => 'parking-circle',
            ],
            [
                'name' => 'Restricted Zone',
                'default_color' => '#dc2626', // Red
                'icon' => 'ban',
            ],
            [
                'name' => 'Building',
                'default_color' => '#16a34a', // Green
                'icon' => 'building',
            ],
            [
                'name' => 'Drop-off Zone',
                'default_color' => '#f59e0b', // Amber
                'icon' => 'clock',
            ],
            [
                'name' => 'Bicycle Area',
                'default_color' => '#8b5cf6', // Purple
                'icon' => 'bike',
            ],
        ];

        foreach ($types as $type) {
            DB::table('map_location_types')->updateOrInsert(
                ['name' => $type['name']],
                $type + ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
