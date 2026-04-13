<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\User;
use App\Models\VehicleViolation;

class VehicleViolationPolicy
{
    /**
     * Administrators may update any violation status.
     * Users with manage_reports may update if unassigned, self-assigned, or same department as assignee.
     */
    public function updateStatus(User $user, VehicleViolation $violation): bool
    {
        if ($user->role === UserRole::ADMINISTRATOR) {
            return true;
        }

        if (! $user->hasPermission(Permission::MANAGE_REPORTS)) {
            return false;
        }

        if ($violation->assigned_to === null || $violation->assigned_to === $user->id) {
            return true;
        }

        $assignee = $violation->relationLoaded('assignee')
            ? $violation->getRelation('assignee')
            : $violation->assignee()->first();

        if ($assignee && $user->department_id && $assignee->department_id === $user->department_id) {
            return true;
        }

        return false;
    }
}
