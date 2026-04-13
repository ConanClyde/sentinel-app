<?php

use App\Enums\UserRole;
use App\Models\MapLocation;
use App\Models\PatrolLog;
use App\Models\User;
use Illuminate\Support\Carbon;

test('successful check-in with valid map_location_id returns 201', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make the check-in request
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'All clear',
    ]);

    // Assert response
    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'security_user_id',
                'map_location_id',
                'checked_in_at',
                'notes',
                'location',
            ],
        ]);

    // Assert database has the record
    $this->assertDatabaseHas('patrol_logs', [
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'notes' => 'All clear',
    ]);
});

test('check-in with invalid map_location_id returns 422 validation error', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Make the check-in request with non-existent location ID
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => 99999,
        'notes' => 'Test',
    ]);

    // Assert validation error
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['map_location_id']);

    // Assert no record was created
    $this->assertDatabaseCount('patrol_logs', 0);
});

test('check-in with inactive location returns 422 with specific error message', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create an inactive map location
    $location = MapLocation::factory()->create([
        'is_active' => false,
    ]);

    // Make the check-in request
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'Test',
    ]);

    // Assert error response
    $response->assertStatus(422)
        ->assertJson([
            'message' => 'This patrol point is no longer active. Please contact administration.',
        ]);

    // Assert no record was created
    $this->assertDatabaseCount('patrol_logs', 0);
});

test('check-in with notes exceeding 1000 characters returns 422', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Create notes exceeding 1000 characters
    $longNotes = str_repeat('a', 1001);

    // Make the check-in request
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => $longNotes,
    ]);

    // Assert validation error
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['notes']);

    // Assert no record was created
    $this->assertDatabaseCount('patrol_logs', 0);
});

test('check-in without authentication returns 401', function () {
    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make the check-in request without authentication
    $response = $this->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'Test',
    ]);

    // Assert unauthorized
    $response->assertStatus(401);

    // Assert no record was created
    $this->assertDatabaseCount('patrol_logs', 0);
});

test('check-in by non-Security Personnel user returns 403', function () {
    // Create a non-Security Personnel user (Staff)
    $user = User::factory()->create([
        'role' => UserRole::STAFF->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make the check-in request
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'Test',
    ]);

    // Assert forbidden
    $response->assertStatus(403);

    // Assert no record was created
    $this->assertDatabaseCount('patrol_logs', 0);
});

test('created PatrolLog has correct security_user_id, map_location_id, and timestamp', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make the check-in request
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
    ]);

    // Assert response is successful
    $response->assertStatus(201);

    // Get the created patrol log
    $patrolLog = PatrolLog::first();

    // Assert the patrol log has correct attributes
    expect($patrolLog->security_user_id)->toBe($user->id)
        ->and($patrolLog->map_location_id)->toBe($location->id)
        ->and($patrolLog->checked_in_at)->toBeInstanceOf(Carbon::class)
        ->and($patrolLog->checked_in_at->diffInSeconds(now()))->toBeLessThan(5);
});

test('notes are stored correctly when provided', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    $testNotes = 'Observed suspicious activity near the entrance. Reported to supervisor.';

    // Make the check-in request with notes
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => $testNotes,
    ]);

    // Assert response is successful
    $response->assertStatus(201);

    // Get the created patrol log
    $patrolLog = PatrolLog::first();

    // Assert notes are stored correctly
    expect($patrolLog->notes)->toBe($testNotes);
});
