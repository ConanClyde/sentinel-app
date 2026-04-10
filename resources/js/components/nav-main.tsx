import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label }: { items: NavItem[]; label?: string }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
            {label && <SidebarGroupLabel className="text-xs group-data-[collapsible=icon]:hidden">{label}</SidebarGroupLabel>}
            <SidebarMenu className="gap-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.url === page.url}>
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon />}
                                <span className="transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
