<?php

namespace Database\Seeders;

use App\Models\Privilege;
use Illuminate\Database\Seeder;

class PrivilegeSeeder extends Seeder
{
    public function run(): void
    {
        // Only privileges that departments can be assigned.
        // No configuration, no create/edit/delete users, no campus map management.
        $privileges = [
            // Reports
            ['name' => 'view_reports', 'category' => 'Reports', 'description' => 'View violation reports (read-only)'],
            ['name' => 'manage_reports', 'category' => 'Reports', 'description' => 'View and update violation report status'],

            // Patrol Monitoring
            ['name' => 'view_patrol_monitor', 'category' => 'Patrol Monitoring', 'description' => 'View live patrol monitoring'],

            // Vehicles & Stickers
            ['name' => 'view_vehicles', 'category' => 'Vehicles & Stickers', 'description' => 'View vehicle records (read-only)'],
            ['name' => 'manage_vehicles', 'category' => 'Vehicles & Stickers', 'description' => 'View, add and delete vehicle records'],
            ['name' => 'view_stickers', 'category' => 'Vehicles & Stickers', 'description' => 'View sticker records (read-only)'],
            ['name' => 'manage_stickers', 'category' => 'Vehicles & Stickers', 'description' => 'View and process sticker requests'],
            ['name' => 'manage_invoices', 'category' => 'Vehicles & Stickers', 'description' => 'View and process sticker fee invoices'],

            // User Management (view only)
            ['name' => 'view_students', 'category' => 'User Management', 'description' => 'View student records'],
            ['name' => 'view_staff', 'category' => 'User Management', 'description' => 'View staff records'],
            ['name' => 'view_stakeholders', 'category' => 'User Management', 'description' => 'View stakeholder records'],
            ['name' => 'view_security', 'category' => 'User Management', 'description' => 'View security personnel records'],
        ];

        foreach ($privileges as $privilege) {
            Privilege::updateOrCreate(
                ['name' => $privilege['name']],
                $privilege
            );
        }

        // Remove privileges that should no longer exist
        $allowed = array_column($privileges, 'name');
        Privilege::whereNotIn('name', $allowed)->delete();
    }
}
