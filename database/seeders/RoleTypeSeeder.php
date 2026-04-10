<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $roleTypes = [
            // Department sub-types
            ['main_role' => UserRole::DEPARTMENT->value, 'name' => 'Chancellor', 'description' => 'Chancellor of the institution'],
            ['main_role' => UserRole::DEPARTMENT->value, 'name' => 'SAS', 'description' => 'Student Affairs & Services'],
            ['main_role' => UserRole::DEPARTMENT->value, 'name' => 'Security Department', 'description' => 'Security Department'],
            ['main_role' => UserRole::DEPARTMENT->value, 'name' => 'Marketing Department', 'description' => 'Marketing Department'],
            ['main_role' => UserRole::DEPARTMENT->value, 'name' => 'DRRM', 'description' => 'Disaster Risk Reduction and Management'],
            ['main_role' => UserRole::DEPARTMENT->value, 'name' => 'Planning Department', 'description' => 'Planning Department'],
            ['main_role' => UserRole::DEPARTMENT->value, 'name' => 'Auxiliary Services', 'description' => 'Auxiliary Services'],

            // Reporter sub-types
            ['main_role' => UserRole::REPORTER->value, 'name' => 'SBO', 'description' => 'Student Body Organization'],
            ['main_role' => UserRole::REPORTER->value, 'name' => 'DRRM Facilitator', 'description' => 'DRRM Facilitator'],
            ['main_role' => UserRole::REPORTER->value, 'name' => 'SAS Facilitator', 'description' => 'SAS Facilitator'],
            ['main_role' => UserRole::REPORTER->value, 'name' => 'Security Personnel', 'description' => 'Security Personnel Reporter'],

            // Stakeholder sub-types
            ['main_role' => UserRole::STAKEHOLDER->value, 'name' => 'Guardian', 'description' => 'Parent/Guardian of student'],
            ['main_role' => UserRole::STAKEHOLDER->value, 'name' => 'Service Provider', 'description' => 'External service provider'],
            ['main_role' => UserRole::STAKEHOLDER->value, 'name' => 'Visitor', 'description' => 'Visitor to campus'],
        ];

        foreach ($roleTypes as $roleType) {
            DB::table('role_types')->updateOrInsert(
                ['name' => $roleType['name'], 'main_role' => $roleType['main_role']],
                $roleType + ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
