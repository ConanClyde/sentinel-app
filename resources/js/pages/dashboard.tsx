import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, QrCode, ShieldCheck, User as UserIcon, AlertCircle, ChevronRight } from 'lucide-react';

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

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome, {user.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        Your central command for identity management, vehicle transit authorization, and security protocols.
                    </p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                                Security Status
                            </CardTitle>
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">Active</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Verified Resident</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Transit Authorization
                            </CardTitle>
                            <Car className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">--</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Active Stickers</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                Digital Credentials
                            </CardTitle>
                            <QrCode className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-foreground font-mono">SNTL-{user.id.toString().padStart(5, '0')}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Sentinel ID Serial</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                    {/* Identity Profile */}
                    <Card className="md:col-span-2 lg:col-span-4 border-muted/40 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-primary" />
                                Identity Profile
                            </CardTitle>
                            <CardDescription>Your system-level identity and verified status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</p>
                                    <p className="text-lg font-bold tracking-tight">{user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Email</p>
                                    <p className="text-lg font-bold tracking-tight truncate">{user.email}</p>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Permission Level</p>
                                    <Badge className="bg-primary/10 text-primary border-none font-semibold text-sm">
                                        {(user.role as string) || 'Standard Resident'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4 sm:gap-6">
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02]">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-3">
                                <Button variant="outline" className="h-auto flex items-center justify-between py-4 border-muted/50 hover:bg-background hover:shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Car className="h-5 w-5 text-blue-500" />
                                        <span className="text-sm font-semibold">Register New Vehicle</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button variant="outline" className="h-auto flex items-center justify-between py-4 border-muted/50 hover:bg-background hover:shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <UserIcon className="h-5 w-5 text-green-500" />
                                        <span className="text-sm font-semibold">Update Profile Info</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-slate-900 text-white overflow-hidden relative shadow-lg">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold leading-none">Need Assistance?</h3>
                                    <p className="text-slate-400 text-sm">Campus Security Office</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Contact the campus security office for help with vehicle stickers or access issues.
                                    </p>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <AlertCircle className="h-20 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
