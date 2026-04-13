<?php

namespace App\Enums;

enum UserRole: string
{
    case STUDENT = 'Student';
    case STAFF = 'Staff';
    case STAKEHOLDER = 'Stakeholder';
    case REPORTER = 'Reporter';
    case SECURITY_PERSONNEL = 'Security Personnel';
    case DEPARTMENT_OFFICER = 'Department Officer';
    case ADMINISTRATOR = 'Administrator';

    public function label(): string
    {
        return match ($this) {
            self::ADMINISTRATOR => 'Administrator',
            self::DEPARTMENT_OFFICER => 'Department Officer',
            self::STUDENT => 'Student',
            self::STAFF => 'Staff',
            self::SECURITY_PERSONNEL => 'Security Personnel',
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
