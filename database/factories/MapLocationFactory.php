<?php

namespace Database\Factories;

use App\Models\MapLocation;
use App\Models\MapLocationType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MapLocation>
 */
class MapLocationFactory extends Factory
{
    protected $model = MapLocation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'short_code' => strtoupper(fake()->unique()->lexify('???')),
            'description' => fake()->optional()->sentence(),
            'type_id' => MapLocationType::factory(),
            'vertices' => [
                ['x' => 10, 'y' => 10],
                ['x' => 20, 'y' => 10],
                ['x' => 20, 'y' => 20],
                ['x' => 10, 'y' => 20],
            ],
            'center_x' => 15.0,
            'center_y' => 15.0,
            'color' => fake()->hexColor(),
            'is_active' => true,
            'created_by' => User::factory(),
        ];
    }
}
