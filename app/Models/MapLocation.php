<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MapLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'short_code',
        'type_id',
        'vertices',
        'center_x',
        'center_y',
        'color',
        'is_active',
        'created_by',
        'sticker_path',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'vertices' => 'array',
        'is_active' => 'boolean',
        'center_x' => 'float',
        'center_y' => 'float',
    ];

    /**
     * Relationship with Location Type.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(MapLocationType::class, 'type_id');
    }

    /**
     * Relationship with Creator (Admin).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Helper to get SVG-compatible points string from vertices.
     * Format: "x1,y1 x2,y2 x3,y3 ..."
     */
    public function getPolygonPointsAttributeString(): string
    {
        if (! is_array($this->vertices)) {
            return '';
        }

        return collect($this->vertices)
            ->map(fn ($v) => "{$v['x']},{$v['y']}")
            ->implode(' ');
    }

    /**
     * Relationship with Patrol Logs.
     */
    public function patrolLogs(): HasMany
    {
        return $this->hasMany(PatrolLog::class);
    }
}
