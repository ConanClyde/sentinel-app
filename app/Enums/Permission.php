<?php

namespace App\Enums;

enum Permission: string
{
    case VIEW_DASHBOARD = 'view_dashboard';
    case VIEW_USERS = 'view_users';
    case CREATE_USER = 'create_user';
    case EDIT_USER = 'edit_user';
    case DELETE_USER = 'delete_user';
    case VIEW_VEHICLES = 'view_vehicles';
    case CREATE_VEHICLE = 'create_vehicle';
    case EDIT_VEHICLE = 'edit_vehicle';
    case DELETE_VEHICLE = 'delete_vehicle';
    case VIEW_REGISTRATIONS = 'view_registrations';
    case APPROVE_REGISTRATION = 'approve_registration';
    case REJECT_REGISTRATION = 'reject_registration';
    case DIRECT_REGISTRATION = 'direct_registration';
    case VIEW_STICKERS = 'view_stickers';
    case PRINT_STICKERS = 'print_stickers';
    case VIEW_REPORTS = 'view_reports';
    case CREATE_REPORT = 'create_report';
    case MANAGE_REPORTS = 'manage_reports';
    case VIEW_CONFIG = 'view_config';
    case EDIT_CONFIG = 'edit_config';
    case VIEW_MAP = 'view_map';
    case MANAGE_PATROLS = 'manage_patrols';
    case SCAN_QR = 'scan_qr';
    case VIEW_STICKER_COLORS = 'view_sticker_colors';
    case EDIT_STICKER_COLORS = 'edit_sticker_colors';
    case VIEW_VEHICLE_TYPES = 'view_vehicle_types';
    case EDIT_VEHICLE_TYPES = 'edit_vehicle_types';
    case VIEW_STAKEHOLDER_TYPES = 'view_stakeholder_types';
    case EDIT_STAKEHOLDER_TYPES = 'edit_stakeholder_types';
    case VIEW_COLLEGES = 'view_colleges';
    case EDIT_COLLEGES = 'edit_colleges';
    case VIEW_PROGRAMS = 'view_programs';
    case EDIT_PROGRAMS = 'edit_programs';
    case MANAGE_MAP = 'manage_map';
    case VIEW_VIOLATION_TYPES = 'view_violation_types';
    case EDIT_VIOLATION_TYPES = 'edit_violation_types';
    case VIEW_VIOLATION_ROUTING = 'view_violation_routing';
    case EDIT_VIOLATION_ROUTING = 'edit_violation_routing';
    case VIEW_STICKER_RULES = 'view_sticker_rules';
    case EDIT_STICKER_RULES = 'edit_sticker_rules';
    case VIEW_LOCATION_TYPES = 'view_location_types';
    case EDIT_LOCATION_TYPES = 'edit_location_types';
    case MANAGE_DEPARTMENTS = 'manage_departments';
    case VIEW_INVOICES = 'view_invoices';
    case EDIT_INVOICES = 'edit_invoices';
    case VIEW_STUDENTS = 'view_students';
    case VIEW_STAFF = 'view_staff';
    case VIEW_STAKEHOLDERS = 'view_stakeholders';
    case VIEW_SECURITY = 'view_security';

    public function label(): string
    {
        return match ($this) {
            self::VIEW_DASHBOARD => 'View Dashboard',
            self::VIEW_USERS => 'View Users',
            self::CREATE_USER => 'Create User',
            self::EDIT_USER => 'Edit User',
            self::DELETE_USER => 'Delete User',
            self::VIEW_VEHICLES => 'View Vehicles',
            self::CREATE_VEHICLE => 'Create Vehicle',
            self::EDIT_VEHICLE => 'Edit Vehicle',
            self::DELETE_VEHICLE => 'Delete Vehicle',
            self::VIEW_REGISTRATIONS => 'View Registrations',
            self::APPROVE_REGISTRATION => 'Approve Registration',
            self::REJECT_REGISTRATION => 'Reject Registration',
            self::DIRECT_REGISTRATION => 'Direct Registration',
            self::VIEW_STICKERS => 'View Stickers',
            self::PRINT_STICKERS => 'Print Stickers',
            self::VIEW_REPORTS => 'View Reports',
            self::CREATE_REPORT => 'Create Report',
            self::MANAGE_REPORTS => 'Manage Reports',
            self::VIEW_CONFIG => 'View Configuration',
            self::EDIT_CONFIG => 'Edit Configuration',
            self::VIEW_MAP => 'View Map',
            self::MANAGE_PATROLS => 'Manage Patrols',
            self::SCAN_QR => 'Scan QR Code',
            self::VIEW_STICKER_COLORS => 'View Sticker Colors',
            self::EDIT_STICKER_COLORS => 'Edit Sticker Colors',
            self::VIEW_VEHICLE_TYPES => 'View Vehicle Types',
            self::EDIT_VEHICLE_TYPES => 'Edit Vehicle Types',
            self::VIEW_STAKEHOLDER_TYPES => 'View Stakeholder Types',
            self::EDIT_STAKEHOLDER_TYPES => 'Edit Stakeholder Types',
            self::VIEW_COLLEGES => 'View Colleges',
            self::EDIT_COLLEGES => 'Edit Colleges',
            self::VIEW_PROGRAMS => 'View Programs',
            self::EDIT_PROGRAMS => 'Edit Programs',
            self::MANAGE_MAP => 'Manage Campus Map',
            self::VIEW_VIOLATION_TYPES => 'View Violation Types',
            self::EDIT_VIOLATION_TYPES => 'Edit Violation Types',
            self::VIEW_VIOLATION_ROUTING => 'View Violation Routing',
            self::EDIT_VIOLATION_ROUTING => 'Edit Violation Routing',
            self::VIEW_STICKER_RULES => 'View Sticker Rules',
            self::EDIT_STICKER_RULES => 'Edit Sticker Rules',
            self::VIEW_LOCATION_TYPES => 'View Location Types',
            self::EDIT_LOCATION_TYPES => 'Edit Location Types',
            self::MANAGE_DEPARTMENTS => 'Manage Departments',
            self::VIEW_INVOICES => 'View Invoices',
            self::EDIT_INVOICES => 'Edit Invoices',
            self::VIEW_STUDENTS => 'View Students',
            self::VIEW_STAFF => 'View Staff',
            self::VIEW_STAKEHOLDERS => 'View Stakeholders',
            self::VIEW_SECURITY => 'View Security Personnel',
        };
    }
}
