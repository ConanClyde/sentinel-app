<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\RoleType;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdministratorSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.admin_email', 'admin@sentinel.com');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => 'Admin',
                'middle_name' => null,
                'surname' => 'Administrator',
                'name_extension' => null,
                'password' => Hash::make('admin123'),
                'role' => UserRole::ADMINISTRATOR,
                'role_type_id' => null,
                'email_verified_at' => now(),
            ]
        );
    }
}
