<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehicleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $vehicleTypes = [
            ['name' => 'Motorcycle', 'description' => 'Two-wheeled motorcycle', 'has_plate_number' => true],
            ['name' => 'Car', 'description' => 'Four-wheeled car', 'has_plate_number' => true],
            ['name' => 'Tricycle', 'description' => 'Three-wheeled vehicle', 'has_plate_number' => true],
            ['name' => 'Electric Car', 'description' => 'Electric-powered four-wheeled car', 'has_plate_number' => true],
            ['name' => 'Electric Bike', 'description' => 'Electric-powered two-wheeled bike', 'has_plate_number' => false],
        ];

        foreach ($vehicleTypes as $type) {
            DB::table('vehicle_types')->updateOrInsert(
                ['name' => $type['name']],
                $type + ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
