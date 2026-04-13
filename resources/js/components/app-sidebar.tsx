import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { UserRole, type UserRoleType } from '@/enums';
import { Permissions } from '@/lib/permissions';
import { type NavItem, type SharedData, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    Car,
    ClipboardList,
    IdCard,
    LayoutGrid,
    Map,
    QrCode,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Tag,
    Ticket,
    Receipt,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, pendingApprovalsCount, pendingReportsCount, myPendingReportsCount } = usePage<SharedData>().props;
    const userRole = (auth.user as User).role as UserRoleType;
    const perms = (auth.user as User).permissions ?? [];
    const has = (p: string) => perms.includes(p);

    // Registered users (Student/Staff/Stakeholder) always use their own sidebar,
    // never the admin sidebar — even though they share some permissions like VIEW_MAP.
    const isRegisteredUser = ([UserRole.STUDENT, UserRole.STAFF, UserRole.STAKEHOLDER] as UserRoleType[]).includes(userRole);

    // These roles always use their own dedicated sidebar, never the admin sidebar
    const isNonAdminRole = isRegisteredUser ||
        userRole === UserRole.DEPARTMENT_OFFICER ||
        userRole === UserRole.REPORTER ||
        userRole === UserRole.SECURITY_PERSONNEL;

    const dashboardItem: NavItem[] = [
        {
            title: 'Dashboard',
            url: route('dashboard'),
            icon: LayoutGrid,
        },
    ];

    const managementItems: NavItem[] = [];
    const operationsItems: NavItem[] = [];
    const securityPatrolItems: NavItem[] = [];
    const securityReportItems: NavItem[] = [];
    const reporterItems: NavItem[] = [];
    const departmentItems: NavItem[] = [];
    const registeredItems: NavItem[] = [];
    const vehicleItems: NavItem[] = [];

    const historyItems: NavItem[] = [];

    if (has(Permissions.VIEW_REPORTS)) {
        operationsItems.push({
            title: 'Reports',
            url: route('admin.reports.index'),
            icon: ShieldAlert,
            badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
        });
    }
    if (has(Permissions.VIEW_REGISTRATIONS)) {
        operationsItems.push({
            title: 'Pending Approvals',
            url: route('admin.pending-approvals.index'),
            icon: ShieldCheck,
            badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        });
    }
    if (has(Permissions.DIRECT_REGISTRATION)) {
        operationsItems.push({
            title: 'Registration',
            url: route('admin.registration.index'),
            icon: IdCard,
        });
    }
    if (has(Permissions.VIEW_VEHICLES)) {
        operationsItems.push({
            title: 'Pending Vehicles',
            url: route('admin.pending-vehicles.index'),
            icon: Car,
        });
    }

    if (has(Permissions.VIEW_CONFIG)) {
        managementItems.push({
            title: 'Configuration',
            url: route('admin.config.index'),
            icon: Settings,
        });
    }
    if (has(Permissions.VIEW_USERS)) {
        managementItems.push({
            title: 'User Management',
            url: route('admin.users.index'),
            icon: Users,
        });
    }
    if (has(Permissions.VIEW_VEHICLES)) {
        managementItems.push({
            title: 'Vehicles',
            url: route('shared.vehicles'),
            icon: Car,
        });
    }
    if (has(Permissions.VIEW_MAP)) {
        managementItems.push({
            title: 'Campus Map',
            url: route('shared.map'),
            icon: Map,
        });
    }
    if (has(Permissions.MANAGE_PATROLS)) {
        managementItems.push({
            title: 'Patrol Monitor',
            url: route('admin.patrol.index'),
            icon: Activity,
        });
    }
    if (has(Permissions.VIEW_STICKERS)) {
        managementItems.push({
            title: 'Stickers',
            url: route('admin.stickers.index'),
            icon: Ticket,
        });
        managementItems.push({
            title: 'Sticker Requests',
            url: route('admin.sticker-requests.index'),
            icon: Tag,
        });
        if (has('view_invoices')) {
            managementItems.push({
                title: 'Invoices',
                url: route('admin.invoices.index'),
                icon: Receipt,
            });
        }
    }

    const showAdminSidebar = !isNonAdminRole && (operationsItems.length > 0 || managementItems.length > 0);

    if (userRole === UserRole.SECURITY_PERSONNEL) {
        securityPatrolItems.push(
            { title: 'Scan Patrol Point', url: route('security.scan'), icon: QrCode },
            { title: 'My Patrol History', url: route('security.history'), icon: Activity },
        );

        securityReportItems.push(
            { title: 'Report User', url: route('shared.report'), icon: ShieldAlert },
            {
                title: 'My Reports',
                url: route('shared.my-reports'),
                icon: ClipboardList,
                badge: myPendingReportsCount > 0 ? myPendingReportsCount : undefined,
            },
            { title: 'My Violations', url: route('shared.report-history'), icon: ShieldAlert },
        );

        vehicleItems.push(
            { title: 'My Vehicles', url: route('shared.vehicles'), icon: Car },
            { title: 'Request Stickers', url: route('shared.sticker-requests'), icon: Tag },
        );
    }

    if (userRole === UserRole.REPORTER) {
        reporterItems.push(
            { title: 'Dashboard', url: route('dashboard'), icon: LayoutGrid },
            { title: 'Report User', url: route('shared.report'), icon: ShieldAlert },
            {
                title: 'My Reports',
                url: route('shared.my-reports'),
                icon: ClipboardList,
                badge: myPendingReportsCount > 0 ? myPendingReportsCount : undefined,
            },
        );
    }

    const departmentOperationsItems: NavItem[] = [];
    const departmentManagementItems: NavItem[] = [];

    if (userRole === UserRole.DEPARTMENT_OFFICER) {
        // Operations group: Reports, Patrol
        if (has(Permissions.VIEW_REPORTS)) {
            departmentOperationsItems.push({
                title: 'Reports',
                url: route('admin.reports.index'),
                icon: ShieldAlert,
                badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
            });
        }
        if (has(Permissions.MANAGE_PATROLS)) {
            departmentOperationsItems.push({ title: 'Patrol Monitor', url: route('admin.patrol.index'), icon: Activity });
        }

        // Management group: Users, Vehicles, Stickers, Sticker Requests, Invoices
        if (has(Permissions.VIEW_USERS)) {
            departmentManagementItems.push({ title: 'Users', url: route('admin.users.index'), icon: Users });
        }
        if (has(Permissions.VIEW_VEHICLES)) {
            departmentManagementItems.push({ title: 'Vehicles', url: route('shared.vehicles'), icon: Car });
        }
        if (has(Permissions.VIEW_STICKERS)) {
            departmentManagementItems.push({ title: 'Stickers', url: route('admin.stickers.index'), icon: Ticket });
            departmentManagementItems.push({ title: 'Sticker Requests', url: route('admin.sticker-requests.index'), icon: Tag });
        }
        if (has('view_invoices')) {
            departmentManagementItems.push({ title: 'Invoices', url: route('admin.invoices.index'), icon: Receipt });
        }
    }

    if (isRegisteredUser) {
        registeredItems.push(
            { title: 'Dashboard', url: route('dashboard'), icon: LayoutGrid },
            { title: 'Campus Map', url: route('shared.map'), icon: Map },
        );
        vehicleItems.push(
            { title: 'My Vehicles', url: route('shared.vehicles'), icon: Car },
            { title: 'Request Stickers', url: route('shared.sticker-requests'), icon: Tag },
        );
        historyItems.push({ title: 'Report History', url: route('shared.report-history'), icon: ClipboardList });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Settings',
            url: '#',
            icon: Settings,
        },
        {
            title: 'Documentation',
            url: 'https://laravel.com/docs',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {showAdminSidebar ? (
                    <>
                        <NavMain items={dashboardItem} label="Platform" />
                        <NavMain items={operationsItems} label="Operations" />
                        <NavMain items={managementItems} label="Management" />
                    </>
                ) : (
                    <>
                        {securityPatrolItems.length > 0 && <NavMain items={securityPatrolItems} label="Patrol" />}
                        {securityReportItems.length > 0 && <NavMain items={securityReportItems} label="Reporting" />}
                        {reporterItems.length > 0 && <NavMain items={reporterItems} label="Enforcement" />}
                        {userRole === UserRole.DEPARTMENT_OFFICER && (
                            <>
                                <NavMain items={dashboardItem} label="Platform" />
                                {departmentOperationsItems.length > 0 && <NavMain items={departmentOperationsItems} label="Operations" />}
                                {departmentManagementItems.length > 0 && <NavMain items={departmentManagementItems} label="Management" />}
                            </>
                        )}
                        {registeredItems.length > 0 && <NavMain items={registeredItems} label="Platform" />}
                        {historyItems.length > 0 && <NavMain items={historyItems} label="History" />}
                        {vehicleItems.length > 0 && <NavMain items={vehicleItems} label="Vehicles" />}
                        {(userRole === UserRole.REPORTER || userRole === UserRole.SECURITY_PERSONNEL) && (
                            <NavMain items={[{ title: 'Campus Map', url: route('shared.map'), icon: Map }]} label="Operations" />
                        )}
                    </>
                )}
            </SidebarContent>

            <SidebarFooter className="px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
