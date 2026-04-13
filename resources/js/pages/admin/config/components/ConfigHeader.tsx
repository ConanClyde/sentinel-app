import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ConfigHeaderProps {
    title: string;
    description: string;
    activeTab: string;
    tabs: { id: string; label: string; href: string }[];
    currentTab: { id: string; addLabel: string; href: string };
}

export function ConfigHeader({ title, description, activeTab, tabs, currentTab }: ConfigHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            <div className="flex gap-2">
                <Select value={activeTab} onValueChange={(value) => router.get(tabs.find(t => t.id === value)?.href || '')}>
                    <SelectTrigger className="md:hidden w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                        {tabs.map((tab) => (
                            <SelectItem key={tab.id} value={tab.id} className="px-3">
                                {tab.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {currentTab.addLabel && (
                    <Button size="sm" className="gap-2 w-full sm:w-auto" onClick={() => { sessionStorage.setItem('openModal', currentTab.id); router.get(currentTab.href, {}, { replace: true }); }}>
                        <Plus className="h-4 w-4" /> {currentTab.addLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
