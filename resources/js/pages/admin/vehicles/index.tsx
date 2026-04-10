import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Vehicle Registry', href: route('admin.vehicles.index') },
];

export default function VehicleIndex({ vehicles }: { vehicles: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Registry" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">Vehicle Registry</h1>
                <p className="text-muted-foreground mt-2">Track campus vehicle stickers and license plates.</p>
                <div className="mt-8 border-2 border-dashed rounded-3xl p-12 text-center text-muted-foreground">
                    Table view for {vehicles.length} vehicles is coming soon.
                </div>
            </div>
        </AppLayout>
    );
}
