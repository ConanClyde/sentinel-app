<?php

use App\Models\MapLocation;
use App\Models\PatrolLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('fillable attributes are correctly defined', function () {
    $fillable = (new PatrolLog)->getFillable();

    expect($fillable)->toContain('security_user_id')
        ->and($fillable)->toContain('map_location_id')
        ->and($fillable)->toContain('checked_in_at')
        ->and($fillable)->toContain('notes');
});

test('checked_in_at is cast to datetime', function () {
    $patrolLog = new PatrolLog;
    $casts = $patrolLog->getCasts();

    expect($casts)->toHaveKey('checked_in_at')
        ->and($casts['checked_in_at'])->toBe('datetime');
});

test('securityUser relationship returns User instance', function () {
    // Create a user
    $user = User::factory()->create();

    // Create a map location
    $mapLocation = MapLocation::factory()->create();

    // Create a patrol log
    $patrolLog = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $mapLocation->id,
        'checked_in_at' => now(),
        'notes' => 'Test note',
    ]);

    // Test the relationship
    expect($patrolLog->securityUser)->toBeInstanceOf(User::class)
        ->and($patrolLog->securityUser->id)->toBe($user->id);
});

test('location relationship returns MapLocation instance', function () {
    // Create a user
    $user = User::factory()->create();

    // Create a map location
    $mapLocation = MapLocation::factory()->create();

    // Create a patrol log
    $patrolLog = PatrolLog::create([
        'security_user_id' => $user->id,
        'map_location_id' => $mapLocation->id,
        'checked_in_at' => now(),
        'notes' => 'Test note',
    ]);

    // Test the relationship
    expect($patrolLog->location)->toBeInstanceOf(MapLocation::class)
        ->and($patrolLog->location->id)->toBe($mapLocation->id);
});
