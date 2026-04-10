import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, ShieldAlert, Users, Car, Settings } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = (auth.user as any).role; // 'Administrator', 'Student', etc.

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            url: route('dashboard'),
            icon: LayoutGrid,
            isActive: true,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: 'Overview',
            url: route('dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'Pending Approvals',
            url: route('admin.pending-registrations.index'),
            icon: ShieldAlert,
        },
        {
            title: 'User Management',
            url: route('admin.users.index'),
            icon: Users,
        },
        {
            title: 'Vehicle Registry',
            url: route('admin.vehicles.index'),
            icon: Car,
        },
    ];

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
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
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
                <NavMain items={mainNavItems} label="Platform" />
                
                {userRole === 'Administrator' && (
                    <NavMain items={adminNavItems} label="Admin Console" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
