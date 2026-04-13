<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationCode extends Model
{
    protected $fillable = [
        'email',
        'code',
        'first_name',
        'middle_name',
        'surname',
        'name_extension',
        'password',
        'role_type_id',
    ];

    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
