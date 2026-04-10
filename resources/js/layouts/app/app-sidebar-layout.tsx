import { AppNavbar } from '@/components/app-navbar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    useFlashToast();

    return (
        <div className="flex min-h-screen w-full flex-col">
            <AppNavbar />
            <main className="flex-1 p-4 pb-20 md:p-6 lg:p-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
