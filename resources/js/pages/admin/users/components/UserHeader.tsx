import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';

interface UserHeaderProps {
    title: string;
    description: string;
    activeRole: string;
    roles: string[];
    toSlug: (str: string) => string;
}

export function UserHeader({ title, description, activeRole, roles, toSlug }: UserHeaderProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <div className="flex gap-2">
                    {/* Mobile Role Switcher */}
                    <Select value={toSlug(activeRole)} onValueChange={(value) => router.get(route('admin.users.byRole', { role: value }))}>
                        <SelectTrigger className="md:hidden w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="p-0">
                            {roles.map((role) => (
                                <SelectItem key={toSlug(role)} value={toSlug(role)} className="px-3">
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
