<?php

namespace Database\Seeders;

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
            PrivilegeSeeder::class,
            RoleTypeSeeder::class,
            DepartmentPrivilegeSeeder::class,
            VehicleTypeSeeder::class,
            StickerColorSeeder::class,
            MapLocationTypeSeeder::class,
            CollegesSeeder::class,
            ProgramsSeeder::class,
            AdministratorSeeder::class,
            UserRoleSeeder::class,
        ]);
    }
}
