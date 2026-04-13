<?php

use App\Enums\UserRole;
use App\Models\RoleType;
use App\Models\User;
use App\Models\ViolationSetting;

test('admin can view violation routing configuration', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.config.violation-routing'))
        ->assertOk();
});

test('admin can update violation routing department ids', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
        'status' => 'active',
    ]);

    $deptA = RoleType::create([
        'main_role' => 'Department',
        'name' => 'Dept A',
        'description' => null,
    ]);
    $deptB = RoleType::create([
        'main_role' => 'Department',
        'name' => 'Dept B',
        'description' => null,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.config.violation-routing.update'), [
            'default_department_id' => $deptA->id,
            'student_department_id' => $deptB->id,
        ])
        ->assertRedirect();

    $settings = ViolationSetting::query()->first();
    expect($settings)->not->toBeNull()
        ->and($settings->default_department_id)->toBe($deptA->id)
        ->and($settings->student_department_id)->toBe($deptB->id);
});
