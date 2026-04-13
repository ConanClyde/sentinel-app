import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    fullWidth?: boolean;
}

export default ({ children, breadcrumbs, fullWidth, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} fullWidth={fullWidth} {...props}>
        {children}
    </AppLayoutTemplate>
);
