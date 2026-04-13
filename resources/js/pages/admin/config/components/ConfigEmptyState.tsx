import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { LucideIcon } from 'lucide-react';

interface ConfigEmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export function ConfigEmptyState({ title, description, icon: Icon }: ConfigEmptyStateProps) {
    return (
        <Empty className="py-8">
            <EmptyMedia variant="icon">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
        </Empty>
    );
}
