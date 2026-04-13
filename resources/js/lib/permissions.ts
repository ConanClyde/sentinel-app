import { usePage } from '@inertiajs/react';
import type { User, SharedData } from '@/types';
import { UserRole } from '@/enums';

export const Permissions = {
    VIEW_DASHBOARD: 'view_dashboard',
    VIEW_USERS: 'view_users',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    VIEW_VEHICLES: 'view_vehicles',
    CREATE_VEHICLE: 'create_vehicle',
    EDIT_VEHICLE: 'edit_vehicle',
    DELETE_VEHICLE: 'delete_vehicle',
    VIEW_REGISTRATIONS: 'view_registrations',
    APPROVE_REGISTRATION: 'approve_registration',
    REJECT_REGISTRATION: 'reject_registration',
    DIRECT_REGISTRATION: 'direct_registration',
    VIEW_STICKERS: 'view_stickers',
    PRINT_STICKERS: 'print_stickers',
    VIEW_INVOICES: 'view_invoices',
    EDIT_INVOICES: 'edit_invoices',
    VIEW_REPORTS: 'view_reports',
    CREATE_REPORT: 'create_report',
    MANAGE_REPORTS: 'manage_reports',
    VIEW_CONFIG: 'view_config',
    EDIT_CONFIG: 'edit_config',
    VIEW_MAP: 'view_map',
    MANAGE_PATROLS: 'manage_patrols',
    SCAN_QR: 'scan_qr',
    VIEW_STICKER_COLORS: 'view_sticker_colors',
    EDIT_STICKER_COLORS: 'edit_sticker_colors',
    VIEW_VEHICLE_TYPES: 'view_vehicle_types',
    EDIT_VEHICLE_TYPES: 'edit_vehicle_types',
    VIEW_STAKEHOLDER_TYPES: 'view_stakeholder_types',
    EDIT_STAKEHOLDER_TYPES: 'edit_stakeholder_types',
    VIEW_COLLEGES: 'view_colleges',
    EDIT_COLLEGES: 'edit_colleges',
    VIEW_PROGRAMS: 'view_programs',
    EDIT_PROGRAMS: 'edit_programs',
} as const;

export function useHasPermission(permission: string): boolean {
    const { auth } = usePage<SharedData>().props;
    return (auth.user as User | undefined)?.permissions?.includes(permission) ?? false;
}

export function useCan(...permissions: string[]): boolean {
    const { auth } = usePage<SharedData>().props;
    const userPermissions = (auth.user as User | undefined)?.permissions ?? [];
    return permissions.every(p => userPermissions.includes(p));
}

export function useCanAny(...permissions: string[]): boolean {
    const { auth } = usePage<SharedData>().props;
    const userPermissions = (auth.user as User | undefined)?.permissions ?? [];
    return permissions.some(p => userPermissions.includes(p));
}
