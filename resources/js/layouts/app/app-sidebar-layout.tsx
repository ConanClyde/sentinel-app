import { AppNavbar } from '@/components/app-navbar';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { type BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';
import * as React from 'react';

export default function AppSidebarLayout({ 
    children, 
    breadcrumbs = [],
    fullWidth = false 
}: { 
    children: React.ReactNode; 
    breadcrumbs?: BreadcrumbItem[];
    fullWidth?: boolean;
}) {
    useFlashToast();

    return (
        <div className="flex min-h-screen w-full flex-col">
            <AppNavbar />
            <main className="flex-1 bg-background pb-20">
                <div className={cn(
                    "w-full px-4 md:px-6 lg:px-8 py-6",
                    !fullWidth && "max-w-7xl mx-auto"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
