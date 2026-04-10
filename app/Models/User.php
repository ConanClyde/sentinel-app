<?php

namespace App\Models;

use App\Enums\NameExtension;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'middle_name',
        'surname',
        'name_extension',
        'name',
        'email',
        'password',
        'role',
        'role_type_id',
        // Student specific
        'college_id',
        'program_id',
        'student_id',
        // Staff specific
        'staff_id',
        // Stakeholder specific
        'stakeholder_type',
        // Common optional
        'license_number',
        'license_image',
        'face_scan_data',
        'student_id_image',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     *
     * @var array
     */
    protected $appends = ['role', 'role_name'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saving(function (User $user) {
            $user->name = $user->full_name;
        });
    }

    /**
     * Generate the full name from the name parts.
     */
    public function getFullNameAttribute(): string
    {
        $parts = [$this->first_name];

        if ($this->middle_name) {
            $parts[] = substr($this->middle_name, 0, 1).'.';
        }

        $parts[] = $this->surname;

        if ($this->name_extension) {
            $parts[] = $this->name_extension;
        }

        return implode(' ', $parts);
    }

    /**
     * Update the full name based on name parts.
     */
    public function updateFullName(): void
    {
        $this->name = $this->full_name;
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

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function getRoleAttribute(): ?UserRole
    {
        $value = $this->getAttributes()['role'] ?? null;

        if ($value) {
            return UserRole::tryFrom($value);
        }

        return $this->roleType ? UserRole::from($this->roleType->main_role) : null;
    }

    public function getRoleNameAttribute(): ?string
    {
        return $this->roleType?->name ?? $this->role?->label();
    }

    public function isAdministrator(): bool
    {
        return $this->role === UserRole::ADMINISTRATOR;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::STUDENT;
    }

    public function isStaff(): bool
    {
        return $this->role === UserRole::STAFF;
    }

    public function isStakeholder(): bool
    {
        return $this->role === UserRole::STAKEHOLDER;
    }

    public function isGuardian(): bool
    {
        return $this->isStakeholder() && $this->stakeholder_type === 'Guardian';
    }
}
