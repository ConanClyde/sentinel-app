import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Car, QrCode, ShieldCheck, PlusCircle, ChevronRight, AlertCircle, Ticket, History, User as UserIcon, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

interface DashboardProps {
    userVehicles?: any[];
    stickerRequests?: any[];
    violationHistory?: any[];
}

export default function SharedDashboard({ userVehicles = [], stickerRequests = [], violationHistory = [] }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User;

    const activeStickers = userVehicles.filter((v: any) => v.sticker_status === 'active').length;
    const pendingRequests = stickerRequests.filter((sr: any) => sr.status === 'pending').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
                    <p className="text-muted-foreground text-sm">Your central hub for vehicle management, sticker requests, and campus transit access.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-green-600">Account Status</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">Active</div>
                            <p className="text-xs text-muted-foreground mt-1">Verified Account</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-600">Active Stickers</CardTitle>
                            <Car className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{activeStickers}</div>
                            <p className="text-xs text-muted-foreground mt-1">Vehicle clearances</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-purple-600">Pending Requests</CardTitle>
                            <Ticket className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{pendingRequests}</div>
                            <p className="text-xs text-muted-foreground mt-1">Sticker applications</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-amber-500/10 to-amber-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-600">Sentinel ID</CardTitle>
                            <QrCode className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-base sm:text-lg font-bold font-mono">SNTL-{user.id.toString().padStart(5, '0')}</div>
                            <p className="text-xs text-muted-foreground mt-1">Digital credentials</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Row */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
                    {/* User Profile Card */}
                    <Card className="lg:col-span-4 border-muted/40 shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg">Your Profile</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Account information and system access level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</p>
                                    <p className="text-lg font-bold tracking-tight">{user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</p>
                                    <p className="text-lg font-bold tracking-tight truncate">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Type</p>
                                    <Badge className="bg-primary/10 text-primary border-none font-semibold text-sm">
                                        {user.role}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member Since</p>
                                    <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="lg:col-span-3 flex flex-col gap-4 sm:gap-6">
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02]">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-2 sm:gap-3">
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3 sm:py-4 border-muted/50 hover:bg-background hover:shadow-sm active:scale-95 transition-transform" asChild>
                                    <Link href={route('shared.sticker-requests')}>
                                        <PlusCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">Sticker Request</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3 sm:py-4 border-muted/50 hover:bg-background hover:shadow-sm active:scale-95 transition-transform" asChild>
                                    <Link href={route('shared.vehicles')}>
                                        <Car className="h-5 w-5 text-blue-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">My Vehicles</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3 sm:py-4 border-muted/50 hover:bg-background hover:shadow-sm active:scale-95 transition-transform" asChild>
                                    <Link href={route('shared.report-history')}>
                                        <History className="h-5 w-5 text-purple-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">Report History</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3 sm:py-4 border-muted/50 hover:bg-background hover:shadow-sm active:scale-95 transition-transform" asChild>
                                    <Link href={route('profile')}>
                                        <UserIcon className="h-5 w-5 text-amber-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">Profile</span>
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Campus Map Card */}
                        <Card className="border-none bg-slate-900 text-white overflow-hidden relative shadow-lg cursor-pointer" onClick={() => window.location.href = route('shared.map')}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Map className="h-4 w-4 text-primary" />
                                        <Badge className="bg-primary/20 text-primary border-primary/40 uppercase font-semibold text-xs">MAP ACTIVE</Badge>
                                    </div>
                                    <h3 className="text-lg font-bold leading-none">Campus Map</h3>
                                    <p className="text-slate-400 text-sm">View parking zones and campus facilities.</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-medium">System operational</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Map className="h-20 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
