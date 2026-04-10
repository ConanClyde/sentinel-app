import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    useFlashToast();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border/40 px-4 dark:bg-background">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="mr-2 h-4 w-px bg-border" />
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </header>
                <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 bg-background">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
