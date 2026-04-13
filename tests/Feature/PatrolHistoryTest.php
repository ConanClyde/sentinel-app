<?php

use App\Enums\UserRole;
use App\Models\MapLocation;
use App\Models\PatrolLog;
use App\Models\User;

test('getHistory returns only logs for authenticated user', function () {
    // Create two Security Personnel users
    $user1 = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);
    $user2 = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create map locations
    $location1 = MapLocation::factory()->create(['is_active' => true]);
    $location2 = MapLocation::factory()->create(['is_active' => true]);

    // Create patrol logs for user1
    PatrolLog::create([
        'security_user_id' => $user1->id,
        'map_location_id' => $location1->id,
        'checked_in_at' => now()->subHours(2),
        'notes' => 'User 1 log 1',
    ]);
    PatrolLog::create([
        'security_user_id' => $user1->id,
        'map_location_id' => $location2->id,
        'checked_in_at' => now()->subHours(1),
        'notes' => 'User 1 log 2',
    ]);

    // Create patrol logs for user2
    PatrolLog::create([
        'security_user_id' => $user2->id,
        'map_location_id' => $location1->id,
        'checked_in_at' => now()->subMinutes(30),
        'notes' => 'User 2 log',
    ]);

    // Make request as user1
    $response = $this->actingAs($user1)->getJson(route('api.patrol.history'));

    // Assert response
    $response->assertStatus(200);
    $data = $response->json('data');

    // Assert only user1's logs are returned
    expect($data)->toHaveCount(2);
    foreach ($data as $log) {
        expect($log['security_user_id'])->toBe($user1->id);
    }
});

test('getHistory orders logs by checked_in_at descending', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create map locations
    $location = MapLocation::factory()->create(['is_active' => true]);

    // Create patrol logs with different timestamps
    $log1 = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now()->subHours(3),
        'notes' => 'Oldest log',
    ]);
    $log2 = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now()->subHours(1),
        'notes' => 'Middle log',
    ]);
    $log3 = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now(),
        'notes' => 'Newest log',
    ]);

    // Make request
    $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

    // Assert response
    $response->assertStatus(200);
    $data = $response->json('data');

    // Assert logs are in descending order (most recent first)
    expect($data)->toHaveCount(3)
        ->and($data[0]['id'])->toBe($log3->id)
        ->and($data[1]['id'])->toBe($log2->id)
        ->and($data[2]['id'])->toBe($log1->id);
});

test('getHistory includes location relationship data', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create a map location with specific attributes
    $location = MapLocation::factory()->create([
        'is_active' => true,
        'name' => 'Main Gate',
        'short_code' => 'MG',
    ]);

    // Create a patrol log
    PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now(),
        'notes' => 'Test log',
    ]);

    // Make request
    $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

    // Assert response includes location data
    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'security_user_id',
                    'map_location_id',
                    'checked_in_at',
                    'notes',
                    'location' => [
                        'id',
                        'name',
                        'short_code',
                    ],
                ],
            ],
        ]);

    $data = $response->json('data');
    expect($data[0]['location']['id'])->toBe($location->id)
        ->and($data[0]['location']['name'])->toBe('Main Gate')
        ->and($data[0]['location']['short_code'])->toBe('MG');
});

test('getHistory paginates with 15 records per page', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Create a map location
    $location = MapLocation::factory()->create(['is_active' => true]);

    // Create 20 patrol logs
    for ($i = 0; $i < 20; $i++) {
        PatrolLog::create([
            'security_user_id' => $user->id,
            'map_location_id' => $location->id,
            'checked_in_at' => now()->subMinutes($i),
            'notes' => "Log $i",
        ]);
    }

    // Make request for first page
    $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

    // Assert pagination structure
    $response->assertStatus(200)
        ->assertJsonStructure([
            'current_page',
            'data',
            'first_page_url',
            'from',
            'last_page',
            'last_page_url',
            'next_page_url',
            'path',
            'per_page',
            'prev_page_url',
            'to',
            'total',
        ]);

    // Assert first page has 15 records
    $data = $response->json('data');
    expect($data)->toHaveCount(15)
        ->and($response->json('per_page'))->toBe(15)
        ->and($response->json('total'))->toBe(20)
        ->and($response->json('last_page'))->toBe(2)
        ->and($response->json('current_page'))->toBe(1);

    // Make request for second page
    $response2 = $this->actingAs($user)->getJson(route('api.patrol.history', ['page' => 2]));

    // Assert second page has 5 records
    $data2 = $response2->json('data');
    expect($data2)->toHaveCount(5)
        ->and($response2->json('current_page'))->toBe(2);
});

test('getHistory returns empty array when no logs exist', function () {
    // Create a Security Personnel user
    $user = User::factory()->create([
        'role' => UserRole::SECURITY_PERSONNEL->value,
    ]);

    // Make request without creating any logs
    $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

    // Assert response has empty data array
    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->toBeArray()
        ->and($data)->toHaveCount(0)
        ->and($response->json('total'))->toBe(0);
});

test('getHistory without authentication returns 401', function () {
    // Make request without authentication
    $response = $this->getJson(route('api.patrol.history'));

    // Assert unauthorized
    $response->assertStatus(401);
});

test('getHistory by non-Security Personnel returns 403', function () {
    // Create a non-Security Personnel user (Staff)
    $user = User::factory()->create([
        'role' => UserRole::STAFF->value,
    ]);

    // Make request as non-Security Personnel
    $response = $this->actingAs($user)->getJson(route('api.patrol.history'));

    // Assert forbidden
    $response->assertStatus(403);
});
