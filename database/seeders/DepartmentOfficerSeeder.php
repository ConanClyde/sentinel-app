<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\RoleType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DepartmentOfficerSeeder extends Seeder
{
    public function run(): void
    {
        $departments = RoleType::where('main_role', 'Department')->get();

        foreach ($departments as $dept) {
            // Generate a slug-like username from the department name
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $dept->name));
            $email = "officer.{$slug}@sentinel.edu";

            // Skip if already exists
            if (User::where('email', $email)->exists()) {
                $this->command->line("  Skipping {$dept->name} — officer already exists.");
                continue;
            }

            User::create([
                'first_name'         => $dept->name,
                'middle_name'        => '',
                'surname'            => 'Officer',
                'name_extension'     => null,
                'name'               => "{$dept->name} Officer",
                'email'              => $email,
                'password'           => Hash::make('Password1'),
                'role'               => UserRole::DEPARTMENT_OFFICER->value,
                'role_type_id'       => $dept->id,
                'department_id'      => $dept->id,
                'email_verified_at'  => now(),
            ]);

            $this->command->info("  Created officer for: {$dept->name} → {$email}");
        }
    }
}
