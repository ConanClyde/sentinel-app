<?php

namespace Database\Seeders;

use App\Models\Privilege;
use App\Models\RoleType;
use Illuminate\Database\Seeder;

class DepartmentPrivilegeSeeder extends Seeder
{
    public function run(): void
    {
        $assignments = [
            'Auxiliary Services' => [
                'view_dashboard',
                'view_staff',
                'view_vehicles',
                'edit_vehicles',
                'view_stickers',
                'download_stickers',
            ],
            'SAS' => [
                'view_dashboard',
                'view_students',
                'register_students',
                'edit_students',
                'delete_students',
            ],
            'DRRM' => [
                'view_dashboard',
                'view_dashboard_patrol',
                'manage_reports',
                'view_patrol_monitor',
                'view_patrol_history',
                'manage_campus_map',
            ],
            'Security Department' => [
                'view_dashboard_stats',
                'view_dashboard_patrol',
                'view_security',
                'view_reporters',
                'view_vehicles',
                'view_stickers',
                'view_patrol_monitor',
                'view_patrol_history',
            ],
            'Office of the Chancellor' => [
                'view_dashboard',
                'view_dashboard_stats',
                'view_dashboard_revenue',
                'view_administrators',
                'view_staff',
                'view_reporters',
                'manage_reports',
                'view_vehicles',
                'view_stickers',
                'manage_ campus_map',
            ],
            'Planning Department' => [
                'view_dashboard',
                'view_dashboard_stats',
                'view_dashboard_patrol',
                'view_patrol_history',
                'manage_reports',
            ],
            'Marketing Department' => [
                'view_dashboard',
                'view_stakeholders',
                'register_stakeholders',
            ],
        ];

        foreach ($assignments as $deptName => $privNames) {
            $department = RoleType::where('name', $deptName)->where('main_role', 'Department')->first();

            if ($department) {
                $privIds = Privilege::whereIn('name', $privNames)->pluck('id');
                $department->privileges()->syncWithoutDetaching($privIds);
            }
        }
    }
}
