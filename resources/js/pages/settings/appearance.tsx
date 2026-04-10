import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: route('appearance'),
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-10">
                    <div className="flex flex-col gap-8">
                        <HeadingSmall title="Interface Visuals" description="Select your preferred application surfacing. Dark mode is optimized for low-light command environments." />
                        
                        <Card className="border-muted/40 border-[1.5px] p-8 overflow-hidden bg-muted/5">
                            <div className="flex flex-col gap-6">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Select Mode</Label>
                                <AppearanceTabs />
                            </div>
                        </Card>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
