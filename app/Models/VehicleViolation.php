<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleViolation extends Model
{
    protected $fillable = [
        'reported_by',
        'violator_vehicle_id',
        'violator_sticker_number',
        'violation_type_id',
        'description',
        'location',
        'pin_x',
        'pin_y',
        'assigned_to',
        'assigned_to_user_type',
        'status',
        'reported_at',
        'evidence_image',
        'remarks',
        'rejection_reason',
        'updated_by',
        'status_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'reported_at' => 'datetime',
            'status_updated_at' => 'datetime',
        ];
    }

    /**
     * Vehicle that was cited.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'violator_vehicle_id');
    }

    /**
     * The type/category of the violation.
     */
    public function violationType(): BelongsTo
    {
        return $this->belongsTo(ViolationType::class, 'violation_type_id');
    }

    /**
     * User who filed the report.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Officer/user the violation is assigned to.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * User who last updated the status.
     */
    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
