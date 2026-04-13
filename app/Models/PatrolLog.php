<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatrolLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'security_user_id',
        'map_location_id',
        'checked_in_at',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
        ];
    }

    /**
     * The Security Personnel who performed the check-in.
     */
    public function securityUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'security_user_id');
    }

    /**
     * The patrol point location.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(MapLocation::class, 'map_location_id');
    }
}
