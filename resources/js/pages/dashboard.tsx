import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, QrCode, ShieldCheck, User as UserIcon, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Welcome Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {user.name}</h1>
                    <p className="text-muted-foreground text-lg">Manage your Sentinel profile, vehicles, and campus access.</p>
                </div>

                {/* Main Stats/Status Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Status Card */}
                    <Card className="border-muted/40 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                            <ShieldCheck className="h-24 w-24" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-none px-3 py-1 text-sm">
                                    Active Platform Access
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4 font-medium flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> System privileges granted
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sentinel ID Card */}
                    <Card className="border-muted/40 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:-rotate-6 group-hover:scale-110">
                            <QrCode className="h-24 w-24" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Digital ID</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground font-mono mt-1">SNTL-{user.id.toString().padStart(5, '0')}</div>
                            <Button variant="link" className="px-0 h-auto mt-3 text-primary">View Digital Barcode &rarr;</Button>
                        </CardContent>
                    </Card>

                    {/* Vehicles Card */}
                    <Card className="border-muted/40 shadow-sm relative overflow-hidden group md:col-span-2 lg:col-span-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:translate-x-2">
                            <Car className="h-24 w-24" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Registered Vehicles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground mt-1">1</div>
                            <Button variant="link" className="px-0 h-auto mt-3 text-primary">Manage Vehicles &rarr;</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-muted/40 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-muted-foreground"/> Profile Information</CardTitle>
                            <CardDescription>Your registered identity details on the Sentinel platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</span>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</span>
                                    <p className="font-medium truncate">{user.email}</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Role</span>
                                    <div>
                                        <Badge variant="secondary" className="mt-1">{user.role || 'User'}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
