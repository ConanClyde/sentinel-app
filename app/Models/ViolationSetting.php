<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ViolationSetting extends Model
{
    protected $fillable = [
        'default_department_id',
        'student_department_id',
    ];

    public function defaultDepartment(): BelongsTo
    {
        return $this->belongsTo(RoleType::class, 'default_department_id');
    }

    public function studentDepartment(): BelongsTo
    {
        return $this->belongsTo(RoleType::class, 'student_department_id');
    }

    public static function getSingleton(): self
    {
        $row = static::query()->first();
        if ($row) {
            return $row;
        }

        $defaultId = RoleType::query()
            ->where('main_role', 'Department')
            ->where('name', 'Office of the Chancellor')
            ->value('id');

        $studentId = RoleType::query()
            ->where('main_role', 'Department')
            ->where('name', 'SAS')
            ->value('id');

        $row = new static([
            'default_department_id' => $defaultId,
            'student_department_id' => $studentId,
        ]);
        $row->save();

        return $row;
    }
}
