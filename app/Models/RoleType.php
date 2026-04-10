<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoleType extends Model
{
    protected $fillable = [
        'main_role',
        'name',
        'description',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function getMainRoleEnum()
    {
        return UserRole::from($this->main_role);
    }

    public function requiresApproval(): bool
    {
        return $this->getMainRoleEnum()->requiresApproval();
    }
}
