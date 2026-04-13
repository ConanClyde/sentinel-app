import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface AppContentProps extends React.ComponentProps<'div'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ 
    variant = 'header', 
    children, 
    fullWidth = false,
    ...props 
}: AppContentProps & { fullWidth?: boolean }) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <main className={cn(
            "mx-auto flex h-full w-full flex-1 flex-col gap-4 px-4 md:px-6 lg:px-8 py-6 rounded-xl",
            !fullWidth && "max-w-7xl"
        )} {...props}>
            {children}
        </main>
    );
}
