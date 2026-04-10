<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehicleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $vehicleTypes = [
            ['name' => 'Motorcycle', 'description' => 'Two-wheeled motorcycle'],
            ['name' => 'Car', 'description' => 'Four-wheeled car'],
            ['name' => 'Tricycle', 'description' => 'Three-wheeled vehicle'],
            ['name' => 'Electric Vehicle', 'description' => 'Electric-powered vehicle'],
        ];

        foreach ($vehicleTypes as $type) {
            DB::table('vehicle_types')->updateOrInsert(
                ['name' => $type['name']],
                $type + ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
