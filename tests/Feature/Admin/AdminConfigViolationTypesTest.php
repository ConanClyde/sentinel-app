<?php

use App\Enums\UserRole;
use App\Models\StickerColor;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleType;
use App\Models\VehicleViolation;
use App\Models\ViolationType;

test('guest is redirected from violation types configuration', function () {
    $this->get(route('admin.config.violation-types'))->assertRedirect(route('login'));
});

test('admin can view violation types configuration', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.config.violation-types'))
        ->assertOk();
});

test('admin can create a violation type', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.config.violation-types.store'), [
            'name' => 'Test Violation',
            'description' => 'Description line',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('violation_types', ['name' => 'Test Violation']);
});

test('admin can update a violation type', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
        'status' => 'active',
    ]);

    $vt = ViolationType::create(['name' => 'Old Name', 'description' => null]);

    $this->actingAs($admin)
        ->put(route('admin.config.violation-types.update', $vt), [
            'name' => 'New Name',
            'description' => 'Updated',
        ])
        ->assertRedirect();

    expect($vt->fresh()->name)->toBe('New Name');
});

test('admin can delete a violation type without existing reports', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
        'status' => 'active',
    ]);

    $vt = ViolationType::create(['name' => 'Orphan Type', 'description' => null]);

    $this->actingAs($admin)
        ->delete(route('admin.config.violation-types.destroy', $vt))
        ->assertRedirect();

    $this->assertDatabaseMissing('violation_types', ['id' => $vt->id]);
});

test('admin cannot delete a violation type that has reports', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
        'status' => 'active',
    ]);

    $vehicleType = VehicleType::create([
        'name' => 'Four Wheeler',
        'description' => null,
        'has_plate_number' => true,
    ]);
    $color = StickerColor::create([
        'name' => 'Blue',
        'hex_code' => '#0000FF',
    ]);
    $vehicle = Vehicle::create([
        'user_id' => $admin->id,
        'vehicle_type_id' => $vehicleType->id,
        'plate_number' => 'ABC123',
        'sticker_number' => 'BLUE-0999',
        'sticker_color_id' => $color->id,
        'is_active' => true,
    ]);

    $vioType = ViolationType::create(['name' => 'In Use', 'description' => null]);

    VehicleViolation::create([
        'reported_by' => $admin->id,
        'violator_vehicle_id' => $vehicle->id,
        'violator_sticker_number' => 'BLUE-0999',
        'violation_type_id' => $vioType->id,
        'description' => 'Test',
        'location' => 'Campus',
        'status' => 'pending',
        'reported_at' => now(),
    ]);

    $this->actingAs($admin)
        ->from(route('admin.config.violation-types'))
        ->delete(route('admin.config.violation-types.destroy', $vioType))
        ->assertRedirect();

    $this->assertDatabaseHas('violation_types', ['id' => $vioType->id]);
});
