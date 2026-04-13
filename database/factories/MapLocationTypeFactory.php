<?php

namespace Database\Factories;

use App\Models\MapLocationType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MapLocationType>
 */
class MapLocationTypeFactory extends Factory
{
    protected $model = MapLocationType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'default_color' => fake()->hexColor(),
            'icon' => fake()->optional()->word(),
        ];
    }
}
