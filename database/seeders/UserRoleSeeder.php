<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\RoleType;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleType;
use App\Services\StickerService;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        $stickerService = app(StickerService::class);

        // Student with vehicle
        $student = $this->createUser([
            'first_name' => 'Juan',
            'surname' => 'Dela Cruz',
            'email' => 'juan.delacruz@student.edu',
            'role' => UserRole::STUDENT,
            'student_id' => '2024-0001',
            'password' => 'student123',
        ]);

        $this->createVehicle($student, $stickerService, 'Motorcycle', 'ABC1234');

        // Staff with vehicle
        $staff = $this->createUser([
            'first_name' => 'Maria',
            'surname' => 'Santos',
            'email' => 'maria.santos@edu.ph',
            'role' => UserRole::STAFF,
            'staff_id' => 'EMP-001',
            'password' => 'staff123',
        ]);

        $this->createVehicle($staff, $stickerService, 'Car', 'STAFF01');

        // Stakeholder - Guardian with vehicle
        $guardian = $this->createUser([
            'first_name' => 'Roberto',
            'surname' => 'Garcia',
            'email' => 'roberto.garcia@email.com',
            'role' => UserRole::STAKEHOLDER,
            'role_type_id' => RoleType::where('name', 'Guardian')->first()?->id,
            'password' => 'guardian123',
        ]);

        $this->createVehicle($guardian, $stickerService, 'Car', 'GUARD01');

        // Stakeholder - Service Provider with vehicle
        $provider = $this->createUser([
            'first_name' => 'Lito',
            'surname' => 'Mendoza',
            'email' => 'lito.mendoza@delivery.com',
            'role' => UserRole::STAKEHOLDER,
            'role_type_id' => RoleType::where('name', 'Service Provider')->first()?->id,
            'password' => 'provider123',
        ]);

        $this->createVehicle($provider, $stickerService, 'Motorcycle', 'DEL001');

        // Stakeholder - Visitor with vehicle
        $visitor = $this->createUser([
            'first_name' => 'Ana',
            'surname' => 'Bautista',
            'email' => 'ana.bautista@gmail.com',
            'role' => UserRole::STAKEHOLDER,
            'role_type_id' => RoleType::where('name', 'Visitor')->first()?->id,
            'password' => 'visitor123',
        ]);

        $this->createVehicle($visitor, $stickerService, 'Car', 'VIS001');

        // Security Personnel with vehicle
        $security = $this->createUser([
            'first_name' => 'Pedro',
            'surname' => 'Cruz',
            'email' => 'pedro.cruz@security.ph',
            'role' => UserRole::SECURITY_PERSONNEL,
            'staff_id' => 'SEC-001',
            'password' => 'security123',
        ]);

        $this->createVehicle($security, $stickerService, 'Motorcycle', 'SEC001');

        // Reporter - SBO
        $reporter = $this->createUser([
            'first_name' => 'Mark',
            'surname' => 'Torres',
            'email' => 'mark.torres@sbo.edu',
            'role' => UserRole::REPORTER,
            'role_type_id' => RoleType::where('name', 'SBO')->first()?->id,
            'student_id' => '2024-0100',
            'password' => 'reporter123',
        ]);

        // Reporter - DRRM Facilitator
        $reporterDrrm = $this->createUser([
            'first_name' => 'Lisa',
            'surname' => 'Morales',
            'email' => 'lisa.morales@drrm.edu',
            'role' => UserRole::REPORTER,
            'role_type_id' => RoleType::where('name', 'DRRM Facilitator')->first()?->id,
            'password' => 'reporter123',
        ]);

        // Department Officer
        $chancellorDeptId = RoleType::where('name', 'Office of the Chancellor')->first()?->id;
        $deptOfficer = $this->createUser([
            'first_name' => 'Dr. Carmen',
            'surname' => 'Reyes',
            'email' => 'carmen.reyes@edu.ph',
            'role' => UserRole::DEPARTMENT_OFFICER,
            'role_type_id' => $chancellorDeptId,
            'department_id' => $chancellorDeptId,
            'staff_id' => 'DEPT-001',
            'password' => 'dept123',
        ]);
    }

    private function createUser(array $data): User
    {
        return User::updateOrCreate(
            ['email' => $data['email']],
            [
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'surname' => $data['surname'],
                'name_extension' => $data['name_extension'] ?? null,
                'password' => $data['password'] ?? 'password',
                'role' => $data['role']->value,
                'role_type_id' => $data['role_type_id'] ?? null,
                'department_id' => $data['department_id'] ?? null,
                'email_verified_at' => now(),
                'student_id' => $data['student_id'] ?? null,
                'staff_id' => $data['staff_id'] ?? null,
            ]
        );
    }

    private function createVehicle(User $user, StickerService $stickerService, string $vehicleTypeName, ?string $plateNumber): void
    {
        $vehicleType = VehicleType::where('name', $vehicleTypeName)->first();
        if (! $vehicleType) {
            return;
        }

        $stickerColor = $stickerService->calculateStickerColor($user);
        $stickerNumber = $stickerService->generateStickerNumber($stickerColor);

        $vehicle = Vehicle::create([
            'user_id' => $user->id,
            'vehicle_type_id' => $vehicleType->id,
            'plate_number' => $plateNumber,
            'sticker_number' => $stickerNumber,
            'sticker_color_id' => $stickerColor->id,
            'is_active' => true,
        ]);

        // Generate sticker file
        $stickerService->generateSticker($vehicle, $user);
    }
}
