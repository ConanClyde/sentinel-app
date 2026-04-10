<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMINISTRATOR = 'Administrator';
    case DEPARTMENT = 'Department';
    case STUDENT = 'Student';
    case STAFF = 'Staff';
    case SECURITY = 'Security';
    case REPORTER = 'Reporter';
    case STAKEHOLDER = 'Stakeholder';

    public function label(): string
    {
        return match ($this) {
            self::ADMINISTRATOR => 'Administrator',
            self::DEPARTMENT => 'Department',
            self::STUDENT => 'Student',
            self::STAFF => 'Staff',
            self::SECURITY => 'Security',
            self::REPORTER => 'Reporter',
            self::STAKEHOLDER => 'Stakeholder',
        };
    }

    public function requiresApproval(): bool
    {
        return match ($this) {
            self::STUDENT, self::STAFF, self::STAKEHOLDER => true,
            default => false,
        };
    }
}
