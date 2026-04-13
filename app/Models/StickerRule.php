<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StickerRule extends Model
{
    protected $table = 'sticker_rules';

    protected $fillable = [
        'student_expiration_years',
        'staff_expiration_years',
        'security_expiration_years',
        'stakeholder_expiration_years',
        'staff_color',
        'security_color',
        'student_map',
        'stakeholder_map',
        'palette',
    ];

    protected $casts = [
        'student_map' => 'array',
        'stakeholder_map' => 'array',
        'palette' => 'array',
        'student_expiration_years' => 'integer',
        'staff_expiration_years' => 'integer',
        'security_expiration_years' => 'integer',
        'stakeholder_expiration_years' => 'integer',
    ];

    public static function getSingleton(): self
    {
        $rules = static::query()->first();
        if (! $rules) {
            // Build from database values - no hardcoding
            $colors = StickerColor::all();
            $palette = [];
            foreach ($colors as $color) {
                $palette[$color->name] = $color->hex_code;
            }

            // Get first available color for defaults, or null if empty
            $defaultColor = $colors->first()?->name;

            // Build stakeholder map from role_types table
            $stakeholderTypes = RoleType::where('main_role', 'Stakeholder')->get();
            $stakeholderMap = [];
            foreach ($stakeholderTypes as $type) {
                $stakeholderMap[$type->name] = $defaultColor ?? 'White';
            }

            $rules = new static([
                'student_expiration_years' => 4,
                'staff_expiration_years' => 4,
                'security_expiration_years' => 4,
                'stakeholder_expiration_years' => 1,
                'staff_color' => $defaultColor ?? 'White',
                'security_color' => $defaultColor ?? 'White',
                'student_map' => [
                    '12' => $defaultColor ?? 'White',
                    '34' => $defaultColor ?? 'White',
                    '56' => $defaultColor ?? 'White',
                    '78' => $defaultColor ?? 'White',
                    '90' => $defaultColor ?? 'White',
                    'no_plate' => $defaultColor ?? 'White',
                ],
                'stakeholder_map' => $stakeholderMap,
                'palette' => $palette,
            ]);
            $rules->save();
        }

        return $rules;
    }
}
