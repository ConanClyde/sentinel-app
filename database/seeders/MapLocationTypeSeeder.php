<?php

namespace Database\Seeders;

use App\Models\MapLocationType;
use Illuminate\Database\Seeder;

class MapLocationTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Gate', 'default_color' => '#22c55e', 'icon' => 'door-open'],
            ['name' => 'Building', 'default_color' => '#3b82f6', 'icon' => 'building-2'],
            ['name' => 'Parking', 'default_color' => '#f59e0b', 'icon' => 'car'],
            ['name' => 'Zone', 'default_color' => '#8b5cf6', 'icon' => 'square'],
            ['name' => 'Restricted Area', 'default_color' => '#ef4444', 'icon' => 'ban'],
        ];

        foreach ($types as $type) {
            MapLocationType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
