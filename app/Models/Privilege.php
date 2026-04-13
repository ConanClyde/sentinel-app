<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Privilege extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
    ];

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(RoleType::class, 'department_privilege')
            ->withTimestamps();
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
