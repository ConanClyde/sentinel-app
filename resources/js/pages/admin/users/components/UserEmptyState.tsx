import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Users } from 'lucide-react';

interface UserEmptyStateProps {
    activeRole: string;
}

export function UserEmptyState({ activeRole }: UserEmptyStateProps) {
    return (
        <Empty className="py-8">
            <EmptyMedia variant="icon">
                <Users className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>No {activeRole.toLowerCase()}s found</EmptyTitle>
            <EmptyDescription>Try adjusting your search.</EmptyDescription>
        </Empty>
    );
}
