<?php

use App\Enums\UserRole;
use App\Models\MapLocation;
use App\Models\User;

/**
 * Integration tests for patrol route authorization.
 *
 * **Validates: Requirements 5.3, 5.4, 8.1, 8.2, 8.4**
 *
 * These tests verify that:
 * - Unauthenticated requests to patrol endpoints return 401
 * - Non-Security Personnel requests return 403
 * - Security Personnel can access both endpoints
 * - Routes are correctly named and accessible via route() helper
 */
test('unauthenticated request to check-in endpoint returns 401', function () {
    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make request without authentication
    $response = $this->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'Test',
    ]);

    // Assert unauthorized
    $response->assertStatus(401);
});

test('unauthenticated request to history endpoint returns 401', function () {
    // Make request without authentication
    $response = $this->getJson(route('api.patrol.history'));

    // Assert unauthorized
    $response->assertStatus(401);
});

test('non-Security Personnel request to check-in endpoint returns 403', function () {
    // Create a non-Security Personnel user (Student)
    $user = User::factory()->create([
        'role' => UserRole::STUDENT->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make request as Student
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'Test',
    ]);

    // Assert forbidden
    $response->assertStatus(403);
});

test('non-Security Personnel request to history endpoint returns 403', function () {
    // Create a non-Security Personnel user (Staff)
    $user = User::factory()->create([
        'role' => UserRole::STAFF->value,
    ]);

    // Make request as Staff
    $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

    // Assert forbidden
    $response->assertStatus(403);
});

test('Administrator request to check-in endpoint returns 403', function () {
    // Create an Administrator user
    $user = User::factory()->create([
        'role' => UserRole::ADMINISTRATOR->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make request as Administrator
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'Test',
    ]);

    // Assert forbidden (only Security Personnel can check in)
    $response->assertStatus(403);
});

test('Security Personnel can access check-in endpoint', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make request as Security Personnel
    $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
        'map_location_id' => $location->id,
        'notes' => 'Test',
    ]);

    // Assert successful (201 or 200, not 401 or 403)
    $response->assertStatus(201);
});

test('Security Personnel can access history endpoint', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Make request as Security Personnel
    $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

    // Assert successful (200, not 401 or 403)
    $response->assertStatus(200);
});

test('check-in route is correctly named and accessible via route helper', function () {
    // Assert route exists and has correct name
    $routeName = 'api.patrol.check-in';
    expect(route($routeName, [], false))->toBe('/api/patrol/check-in');

    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    // Make request using route helper
    $response = $this->actingAs($user)->postJson(route($routeName), [
        'map_location_id' => $location->id,
    ]);

    // Assert route is accessible
    $response->assertStatus(201);
});

test('history route is correctly named and accessible via route helper', function () {
    // Assert route exists and has correct name
    $routeName = 'api.patrol.history';
    expect(route($routeName, [], false))->toBe('/api/patrol/history');

    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Make request using route helper
    $response = $this->actingAs($user)->getJson(route($routeName));

    // Assert route is accessible
    $response->assertStatus(200);
});

test('check-in route requires POST method', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Try GET request to check-in endpoint
    $response = $this->actingAs($user)->getJson(route('api.patrol.check-in'));

    // Assert method not allowed
    $response->assertStatus(405);
});

test('history route requires GET method', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Try POST request to history endpoint
    $response = $this->actingAs($user)->postJson(route('api.patrol.history'));

    // Assert method not allowed
    $response->assertStatus(405);
});

test('multiple role types are correctly denied access to check-in', function () {
    $deniedRoles = [
        UserRole::STUDENT,
        UserRole::STAFF,
        UserRole::STAKEHOLDER,
        UserRole::DEPARTMENT_OFFICER,
        UserRole::REPORTER,
        UserRole::ADMINISTRATOR,
    ];

    // Create an active map location
    $location = MapLocation::factory()->create([
        'is_active' => true,
    ]);

    foreach ($deniedRoles as $role) {
        // Create user with specific role
        $user = User::factory()->create([
            'role' => $role->value,
        ]);

        // Make request
        $response = $this->actingAs($user)->postJson(route('api.patrol.check-in'), [
            'map_location_id' => $location->id,
        ]);

        // Assert forbidden for each role
        expect($response->status())->toBe(403, "Role {$role->value} should be denied access");
    }
});

test('multiple role types are correctly denied access to history', function () {
    $deniedRoles = [
        UserRole::STUDENT,
        UserRole::STAFF,
        UserRole::STAKEHOLDER,
        UserRole::DEPARTMENT_OFFICER,
        UserRole::REPORTER,
        UserRole::ADMINISTRATOR,
    ];

    foreach ($deniedRoles as $role) {
        // Create user with specific role
        $user = User::factory()->create([
            'role' => $role->value,
        ]);

        // Make request
        $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

        // Assert forbidden for each role
        expect($response->status())->toBe(403, "Role {$role->value} should be denied access");
    }
});
