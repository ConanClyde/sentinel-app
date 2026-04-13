import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label }: { items: NavItem[]; label?: string }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
            {label && (
                <div className="flex items-center justify-between pr-2 mb-2 group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel className="text-xs p-0 h-auto">{label}</SidebarGroupLabel>
                </div>
            )}
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const isActive = page.url === item.url || page.url.startsWith(item.url + '/');
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive}>
                                <Link href={item.url} prefetch className="relative flex items-center justify-between pr-2">
                                    <div className="flex items-center gap-2">
                                        {item.icon && <item.icon />}
                                        <span className="transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">{item.title}</span>
                                    </div>
                                    
                                    {item.badge && (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:-top-1 group-data-[collapsible=icon]:right-1 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-[16px] transition-all shadow-sm">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
