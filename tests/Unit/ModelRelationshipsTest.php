<?php

use App\Models\MapLocation;
use App\Models\PatrolLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('User patrolLogs relationship returns PatrolLog collection', function () {
    // Create a user
    $user = User::factory()->create();

    // Create map locations
    $location1 = MapLocation::factory()->create();
    $location2 = MapLocation::factory()->create();

    // Create patrol logs for this user
    $patrolLog1 = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location1->id,
        'checked_in_at' => now(),
        'notes' => 'First check-in',
    ]);

    $patrolLog2 = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location2->id,
        'checked_in_at' => now()->addHour(),
        'notes' => 'Second check-in',
    ]);

    // Create a patrol log for a different user (should not be included)
    $otherUser = User::factory()->create();
    PatrolLog::create([
        'security_user_id' => $otherUser->id,
        'map_location_id' => $location1->id,
        'checked_in_at' => now(),
        'notes' => 'Other user check-in',
    ]);

    // Test the relationship
    $patrolLogs = $user->patrolLogs;

    expect($patrolLogs)->toHaveCount(2)
        ->and($patrolLogs->first())->toBeInstanceOf(PatrolLog::class)
        ->and($patrolLogs->pluck('id')->toArray())->toContain($patrolLog1->id, $patrolLog2->id);
});

test('MapLocation patrolLogs relationship returns PatrolLog collection', function () {
    // Create users
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    // Create map locations
    $location = MapLocation::factory()->create();
    $otherLocation = MapLocation::factory()->create();

    // Create patrol logs for this location
    $patrolLog1 = PatrolLog::create([
        'security_user_id' => $user1->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now(),
        'notes' => 'First check-in',
    ]);

    $patrolLog2 = PatrolLog::create([
        'security_user_id' => $user2->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now()->addHour(),
        'notes' => 'Second check-in',
    ]);

    // Create a patrol log for a different location (should not be included)
    PatrolLog::create([
        'security_user_id' => $user1->id,
        'map_location_id' => $otherLocation->id,
        'checked_in_at' => now(),
        'notes' => 'Other location check-in',
    ]);

    // Test the relationship
    $patrolLogs = $location->patrolLogs;

    expect($patrolLogs)->toHaveCount(2)
        ->and($patrolLogs->first())->toBeInstanceOf(PatrolLog::class)
        ->and($patrolLogs->pluck('id')->toArray())->toContain($patrolLog1->id, $patrolLog2->id);
});

test('relationship queries work correctly with eager loading', function () {
    // Create a user
    $user = User::factory()->create();

    // Create a map location
    $location = MapLocation::factory()->create();

    // Create a patrol log
    PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now(),
        'notes' => 'Test check-in',
    ]);

    // Test eager loading from User
    $userWithLogs = User::with('patrolLogs')->find($user->id);
    expect($userWithLogs->patrolLogs)->toHaveCount(1)
        ->and($userWithLogs->patrolLogs->first()->map_location_id)->toBe($location->id);

    // Test eager loading from MapLocation
    $locationWithLogs = MapLocation::with('patrolLogs')->find($location->id);
    expect($locationWithLogs->patrolLogs)->toHaveCount(1)
        ->and($locationWithLogs->patrolLogs->first()->security_user_id)->toBe($user->id);
});

test('relationship queries work correctly with filtering', function () {
    // Create a user
    $user = User::factory()->create();

    // Create map locations
    $location1 = MapLocation::factory()->create();
    $location2 = MapLocation::factory()->create();

    // Create patrol logs with different timestamps
    $oldLog = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location1->id,
        'checked_in_at' => now()->subDays(5),
        'notes' => 'Old check-in',
    ]);

    $recentLog = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location2->id,
        'checked_in_at' => now(),
        'notes' => 'Recent check-in',
    ]);

    // Test filtering recent logs (last 3 days)
    $recentLogs = $user->patrolLogs()
        ->where('checked_in_at', '>=', now()->subDays(3))
        ->get();

    expect($recentLogs)->toHaveCount(1)
        ->and($recentLogs->first()->id)->toBe($recentLog->id);
});

test('relationship queries work correctly with ordering', function () {
    // Create a user
    $user = User::factory()->create();

    // Create a map location
    $location = MapLocation::factory()->create();

    // Create patrol logs with different timestamps
    $firstLog = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now()->subHours(2),
        'notes' => 'First check-in',
    ]);

    $secondLog = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now()->subHour(),
        'notes' => 'Second check-in',
    ]);

    $thirdLog = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $location->id,
        'checked_in_at' => now(),
        'notes' => 'Third check-in',
    ]);

    // Test ordering by checked_in_at descending (most recent first)
    $orderedLogs = $user->patrolLogs()
        ->orderBy('checked_in_at', 'desc')
        ->get();

    expect($orderedLogs)->toHaveCount(3)
        ->and($orderedLogs->first()->id)->toBe($thirdLog->id)
        ->and($orderedLogs->last()->id)->toBe($firstLog->id);
});
