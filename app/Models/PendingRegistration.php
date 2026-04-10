<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class PendingRegistration extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'surname',
        'name_extension',
        'email',
        'password',
        'role',
        'role_type_id',
        'license_number',
        'license_image',
        'face_scan_data',
        'status',
        'notes',
        'approved_by',
        'approved_at',
        // Student specific
        'college_id',
        'program_id',
        'student_id',
        'student_id_image',
        // Staff specific
        'staff_id',
        // Stakeholder specific
        'stakeholder_type',
        'student_school_id_image',
        // Email verification
        'email_verified',
        'verification_code',
        'verification_code_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'email_verified' => 'boolean',
            'verification_code_expires_at' => 'datetime',
         ];
    }

    public function roleType(): BelongsTo
    {
        return $this->belongsTo(RoleType::class);
    }

    public function college(): BelongsTo
    {
        return $this->belongsTo(College::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(PendingVehicle::class);
    }

    public function getMainRoleAttribute()
    {
        $value = $this->getAttributes()['role'] ?? null;

        if ($value) {
            return UserRole::tryFrom($value);
        }

        return $this->roleType?->getMainRoleEnum();
    }

    public function requiresApproval(): bool
    {
        return $this->getMainRoleAttribute()?->requiresApproval() ?? false;
    }

    public function isGuardian(): bool
    {
        return $this->getMainRoleAttribute() === UserRole::STAKEHOLDER && $this->stakeholder_type === 'Guardian';
    }

    public function hasValidVerificationCode(string $code): bool
    {
        return $this->verification_code === $code
            && $this->verification_code_expires_at
            && $this->verification_code_expires_at->isFuture();
    }

    public function generateVerificationCode(): void
    {
        $this->verification_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->verification_code_expires_at = now()->addMinutes(10);
        $this->save();
    }
}
