import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'User Management', href: route('admin.users.index') },
];

export default function UserIndex({ users }: { users: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground mt-2">Manage campus residents and their access levels.</p>
                <div className="mt-8 border-2 border-dashed rounded-3xl p-12 text-center text-muted-foreground">
                    Table view for {users.length} users is coming soon.
                </div>
            </div>
        </AppLayout>
    );
}
