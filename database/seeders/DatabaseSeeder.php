<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Core seeders
        $this->call([
            RoleTypeSeeder::class,
            VehicleTypeSeeder::class,
            StickerColorSeeder::class,
            CollegesSeeder::class,
            ProgramsSeeder::class,
            AdministratorSeeder::class,
        ]);
    }
}
