import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, ShieldAlert, Users, Car, Settings, BarChart3, Tag, Map, Activity } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = (auth.user as any).role; // 'Administrator', 'Student', etc.

    const dashboardItem: NavItem[] = [
        {
            title: 'Dashboard',
            url: route('dashboard'),
            icon: LayoutGrid,
            isActive: true,
        },
    ];

    const managementItems: NavItem[] = [];
    const operationsItems: NavItem[] = [];
    const analyticsItems: NavItem[] = [];

    if (userRole === 'Administrator') {
        managementItems.push(
            {
                title: 'User Management',
                url: route('admin.users.index'),
                icon: Users,
            },
            {
                title: 'Pending Users',
                url: route('admin.pending-registrations.index'),
                icon: ShieldAlert,
            },
            {
                title: 'Vehicles',
                url: route('admin.vehicles.index'),
                icon: Car,
            },
        );

        operationsItems.push(
            {
                title: 'Campus Map',
                url: route('admin.map.index'),
                icon: Map,
            },
            {
                title: 'Patrol Monitor',
                url: route('admin.patrol.index'),
                icon: Activity,
            },
            {
                title: 'Stickers',
                url: route('admin.stickers.index'),
                icon: Tag,
            },
        );

        analyticsItems.push({
            title: 'Reports',
            url: route('admin.reports.index'),
            icon: BarChart3,
        });
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
                <ScrollArea className="flex-1">
                    <NavMain items={dashboardItem} label="Platform" />
                    {userRole === 'Administrator' && (
                        <>
                            <NavMain items={managementItems} label="Management" />
                            <NavMain items={operationsItems} label="Operations" />
                            <NavMain items={analyticsItems} label="Analytics" />
                        </>
                    )}
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
