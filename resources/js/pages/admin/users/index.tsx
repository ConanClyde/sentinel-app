import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, MoreHorizontal, Mail, Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: route('admin.users.index') },
];

export default function UserIndex({ users }: { users: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground text-sm">Manage campus residents and their access levels.</p>
                    </div>
                    <Button size="sm" className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-9" />
                </div>

                {/* Users List - Mobile Card View */}
                <div className="grid gap-3">
                    {users.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground text-center">No users found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        users.map((user: any) => (
                            <Card key={user.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-medium">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">{user.name}</p>
                                                {user.role === 'Administrator' && (
                                                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
