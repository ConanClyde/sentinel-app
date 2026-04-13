<?php

use App\Enums\UserRole;
use App\Models\RoleType;
use App\Models\StickerColor;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleType;
use App\Models\VehicleViolation;
use App\Models\ViolationType;

function seedViolationFixtures(): array
{
    $vehicleType = VehicleType::query()->create([
        'name' => 'Test-Car-'.uniqid(),
        'description' => null,
        'has_plate_number' => true,
    ]);
    $stickerColor = StickerColor::query()->create([
        'name' => 'Test-Red-'.uniqid(),
        'hex_code' => '#FF0000',
    ]);
    $violationType = ViolationType::query()->create([
        'name' => 'Test Violation '.uniqid(),
        'description' => null,
    ]);

    return [$vehicleType, $stickerColor, $violationType];
}

test('users without create_report cannot store violations', function () {
    [$vehicleType, $stickerColor, $violationType] = seedViolationFixtures();

    $dept = RoleType::query()->create([
        'main_role' => 'Department',
        'name' => 'Empty Dept '.uniqid(),
        'description' => null,
    ]);

    $user = User::factory()->create([
        'role' => UserRole::DEPARTMENT_OFFICER->value,
        'role_type_id' => $dept->id,
        'department_id' => $dept->id,
    ]);

    $vehicle = Vehicle::query()->create([
        'user_id' => $user->id,
        'vehicle_type_id' => $vehicleType->id,
        'plate_number' => 'TSTPLT1',
        'sticker_number' => 'TST-'.uniqid(),
        'sticker_color_id' => $stickerColor->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('violations.store'), [
        'plate_number' => $vehicle->plate_number,
        'violation_type_id' => $violationType->id,
        'location' => 'Lot A',
        'description' => 'Test report',
    ]);

    $response->assertForbidden();
});

test('users with create_report can store violations', function () {
    [$vehicleType, $stickerColor, $violationType] = seedViolationFixtures();

    $user = User::factory()->create([
        'role' => UserRole::STAFF->value,
    ]);

    $vehicle = Vehicle::query()->create([
        'user_id' => $user->id,
        'vehicle_type_id' => $vehicleType->id,
        'plate_number' => 'TSTPLT2',
        'sticker_number' => 'TST-'.uniqid(),
        'sticker_color_id' => $stickerColor->id,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('violations.store'), [
        'plate_number' => $vehicle->plate_number,
        'violation_type_id' => $violationType->id,
        'location' => 'Lot B',
        'description' => 'Test report',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('vehicle_violations', [
        'reported_by' => $user->id,
        'violator_vehicle_id' => $vehicle->id,
        'status' => 'pending',
    ]);
});

test('users without manage_reports cannot update violation status', function () {
    [$vehicleType, $stickerColor, $violationType] = seedViolationFixtures();

    $staff = User::factory()->create([
        'role' => UserRole::STAFF->value,
    ]);

    $vehicle = Vehicle::query()->create([
        'user_id' => $staff->id,
        'vehicle_type_id' => $vehicleType->id,
        'plate_number' => 'TSTPLT3',
        'sticker_number' => 'TST-'.uniqid(),
        'sticker_color_id' => $stickerColor->id,
        'is_active' => true,
    ]);

    $violation = VehicleViolation::query()->create([
        'reported_by' => $staff->id,
        'violator_vehicle_id' => $vehicle->id,
        'violator_sticker_number' => $vehicle->sticker_number,
        'violation_type_id' => $violationType->id,
        'description' => 'd',
        'location' => 'here',
        'assigned_to' => null,
        'status' => 'pending',
        'reported_at' => now(),
    ]);

    $response = $this->actingAs($staff)->put(route('violations.update-status', $violation), [
        'status' => 'assigned',
        'remarks' => null,
    ]);

    $response->assertForbidden();
});

test('administrators can update violation status', function () {
    [$vehicleType, $stickerColor, $violationType] = seedViolationFixtures();

    $staff = User::factory()->create([
        'role' => UserRole::STAFF->value,
    ]);

    $admin = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
    ]);

    $vehicle = Vehicle::query()->create([
        'user_id' => $staff->id,
        'vehicle_type_id' => $vehicleType->id,
        'plate_number' => 'TSTPLT4',
        'sticker_number' => 'TST-'.uniqid(),
        'sticker_color_id' => $stickerColor->id,
        'is_active' => true,
    ]);

    $violation = VehicleViolation::query()->create([
        'reported_by' => $staff->id,
        'violator_vehicle_id' => $vehicle->id,
        'violator_sticker_number' => $vehicle->sticker_number,
        'violation_type_id' => $violationType->id,
        'description' => 'd',
        'location' => 'here',
        'assigned_to' => null,
        'status' => 'pending',
        'reported_at' => now(),
    ]);

    $response = $this->actingAs($admin)->put(route('violations.update-status', $violation), [
        'status' => 'assigned',
        'remarks' => 'ok',
    ]);

    $response->assertSessionHasNoErrors();
    expect($violation->refresh()->status)->toBe('assigned');
});
