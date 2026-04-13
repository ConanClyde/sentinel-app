<?php

namespace App\Services;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\Privilege;
use App\Models\RoleType;
use App\Models\User;

class RolePermissionService
{
    private static array $rolePermissions = [
        UserRole::ADMINISTRATOR->value => [
            Permission::VIEW_DASHBOARD,
            Permission::VIEW_USERS,
            Permission::CREATE_USER,
            Permission::EDIT_USER,
            Permission::DELETE_USER,
            Permission::VIEW_VEHICLES,
            Permission::CREATE_VEHICLE,
            Permission::EDIT_VEHICLE,
            Permission::DELETE_VEHICLE,
            Permission::VIEW_REGISTRATIONS,
            Permission::APPROVE_REGISTRATION,
            Permission::REJECT_REGISTRATION,
            Permission::DIRECT_REGISTRATION,
            Permission::VIEW_STICKERS,
            Permission::PRINT_STICKERS,
            Permission::VIEW_REPORTS,
            Permission::MANAGE_REPORTS,
            Permission::VIEW_CONFIG,
            Permission::EDIT_CONFIG,
            Permission::VIEW_MAP,
            Permission::MANAGE_MAP,
            Permission::MANAGE_PATROLS,
            Permission::VIEW_STICKER_COLORS,
            Permission::EDIT_STICKER_COLORS,
            Permission::VIEW_VEHICLE_TYPES,
            Permission::EDIT_VEHICLE_TYPES,
            Permission::VIEW_STAKEHOLDER_TYPES,
            Permission::EDIT_STAKEHOLDER_TYPES,
            Permission::VIEW_COLLEGES,
            Permission::EDIT_COLLEGES,
            Permission::VIEW_PROGRAMS,
            Permission::EDIT_PROGRAMS,
            Permission::VIEW_VIOLATION_TYPES,
            Permission::EDIT_VIOLATION_TYPES,
            Permission::VIEW_VIOLATION_ROUTING,
            Permission::EDIT_VIOLATION_ROUTING,
            Permission::VIEW_STICKER_RULES,
            Permission::EDIT_STICKER_RULES,
            Permission::VIEW_LOCATION_TYPES,
            Permission::EDIT_LOCATION_TYPES,
            Permission::MANAGE_DEPARTMENTS,
            Permission::VIEW_INVOICES,
            Permission::EDIT_INVOICES,
        ],
        UserRole::SECURITY_PERSONNEL->value => [
            Permission::VIEW_DASHBOARD,
            Permission::CREATE_REPORT,
            Permission::VIEW_MAP,
            Permission::SCAN_QR,
        ],
        UserRole::REPORTER->value => [
            Permission::VIEW_DASHBOARD,
            Permission::VIEW_REPORTS,
            Permission::CREATE_REPORT,
            Permission::VIEW_MAP,
        ],
        UserRole::STAFF->value => [
            Permission::VIEW_DASHBOARD,
            Permission::VIEW_REPORTS,
            Permission::CREATE_REPORT,
            Permission::VIEW_MAP,
        ],
        UserRole::STUDENT->value => [
            Permission::VIEW_DASHBOARD,
            Permission::VIEW_REPORTS,
            Permission::CREATE_REPORT,
            Permission::VIEW_MAP,
        ],
        UserRole::STAKEHOLDER->value => [
            Permission::VIEW_DASHBOARD,
            Permission::VIEW_REPORTS,
            Permission::CREATE_REPORT,
            Permission::VIEW_MAP,
        ],
    ];

    public static function getPermissionsForRole(string $role): array
    {
        return self::$rolePermissions[$role] ?? [];
    }

    /**
     * Get permissions for a user, including department-based privileges for Department Officers
     */
    public static function getPermissionsForUser(User $user): array
    {
        $role = $user->role?->value;

        // Department Officers get permissions from their assigned department privileges
        if ($role === UserRole::DEPARTMENT_OFFICER->value && $user->department_id) {
            $department = RoleType::find($user->department_id);
            if ($department) {
                $privilegeNames = $department->privileges()->pluck('privileges.name')->toArray();

                // Always include dashboard and map access
                $permissions = [Permission::VIEW_DASHBOARD, Permission::VIEW_MAP];
                foreach ($privilegeNames as $pName) {
                    $permissions = array_merge($permissions, self::mapPrivilegeToPermissions($pName));
                }

                return array_values(array_unique($permissions, SORT_REGULAR));
            }
        }

        // Fallback: Department Officer with no department gets basic access only
        if ($role === UserRole::DEPARTMENT_OFFICER->value) {
            return [Permission::VIEW_DASHBOARD, Permission::VIEW_MAP];
        }

        return self::getPermissionsForRole($role ?? '');
    }

    /**
     * Map privilege name to Permission enums (1:N mapping)
     */
    private static function mapPrivilegeToPermissions(string $privilegeName): array
    {
        $mapping = [
            // Reports
            'view_reports'   => [Permission::VIEW_REPORTS],
            'manage_reports' => [Permission::VIEW_REPORTS, Permission::MANAGE_REPORTS, Permission::CREATE_REPORT],

            // Patrol Monitoring
            'view_patrol_monitor' => [Permission::MANAGE_PATROLS],

            // Vehicles & Stickers
            'view_vehicles'   => [Permission::VIEW_VEHICLES],
            'manage_vehicles' => [Permission::VIEW_VEHICLES, Permission::CREATE_VEHICLE, Permission::EDIT_VEHICLE, Permission::DELETE_VEHICLE],
            'view_stickers'   => [Permission::VIEW_STICKERS, Permission::VIEW_VEHICLES],
            'manage_stickers' => [Permission::VIEW_STICKERS, Permission::VIEW_VEHICLES, Permission::PRINT_STICKERS],
            'view_invoices'   => [Permission::VIEW_INVOICES],
            'manage_invoices' => [Permission::VIEW_INVOICES, Permission::EDIT_INVOICES],
            'edit_invoices' => [Permission::EDIT_INVOICES, Permission::VIEW_INVOICES],

            // User Management (view only)
            'view_students'     => [Permission::VIEW_USERS, Permission::VIEW_REGISTRATIONS, Permission::VIEW_STUDENTS],
            'view_staff'        => [Permission::VIEW_USERS, Permission::VIEW_REGISTRATIONS, Permission::VIEW_STAFF],
            'view_stakeholders' => [Permission::VIEW_USERS, Permission::VIEW_REGISTRATIONS, Permission::VIEW_STAKEHOLDERS],
            'view_security'     => [Permission::VIEW_USERS, Permission::VIEW_REGISTRATIONS, Permission::VIEW_SECURITY],
        ];

        return $mapping[$privilegeName] ?? [Permission::VIEW_DASHBOARD];
    }


    public static function hasPermission(string $role, Permission $permission): bool
    {
        $permissions = self::getPermissionsForRole($role);

        return in_array($permission, $permissions);
    }

    public static function can(string $role, string|Permission $permission): bool
    {
        $permission = is_string($permission) ? Permission::from($permission) : $permission;

        return self::hasPermission($role, $permission);
    }

    public static function getAllPermissions(): array
    {
        return Permission::cases();
    }

    /**
     * Get all available privileges grouped by category
     */
    public static function getAllPrivilegesByCategory(): array
    {
        return Privilege::all()->groupBy('category')->toArray();
    }
}
