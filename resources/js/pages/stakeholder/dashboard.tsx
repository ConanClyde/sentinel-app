import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, QrCode, ShieldCheck, User as UserIcon, Handshake, ChevronRight, AlertCircle, Map } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

export default function StakeholderDashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stakeholder Portal" />

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome, {user.name.split(' ')[0]}</h1>
                    <p className="text-muted-foreground text-sm">
                        Management portal for campus stakeholders and partners. Coordinate your transit logistics and access authorizations through this secure interface.
                    </p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                                Access Authorization
                            </CardTitle>
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">Verified</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Premium Clearance</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Transit Stickers
                            </CardTitle>
                            <Car className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">--</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Authorized Units</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                Partner ID Serial
                            </CardTitle>
                            <QrCode className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-foreground font-mono">SNTL-{user.id.toString().padStart(5, '0')}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Digital Credentials</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                    {/* Stakeholder Profile */}
                    <Card className="md:col-span-2 lg:col-span-4 border-muted/40 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Handshake className="h-4 w-4 text-primary" />
                                Stakeholder Profile
                            </CardTitle>
                            <CardDescription>Your partner identity and system access level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal Name</p>
                                    <p className="text-lg font-bold tracking-tight">{user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Contact</p>
                                    <p className="text-lg font-bold tracking-tight truncate">{user.email}</p>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Classification</p>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-primary/10 text-primary border-none font-semibold text-sm">
                                            {user.role}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">SYSTEM</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logistic Actions */}
                    <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4 sm:gap-6">
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02]">
                            <CardHeader>
                                <CardTitle className="text-lg">Logistic Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-auto flex items-center justify-between py-4 border-muted/50 hover:bg-background hover:shadow-sm"
                                    onClick={() => window.location.href = route('shared.sticker-requests')}
                                >
                                    <div className="flex items-center gap-3">
                                        <Car className="h-5 w-5 text-green-500" />
                                        <span className="text-sm font-semibold">Renew Transit Pass</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button variant="outline" className="h-auto flex items-center justify-between py-4 border-muted/50 hover:bg-background hover:shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <QrCode className="h-5 w-5 text-blue-500" />
                                        <span className="text-sm font-semibold">Campus Guidelines</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-slate-900 text-white overflow-hidden relative shadow-lg cursor-pointer" onClick={() => window.location.href = route('shared.map')}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Map className="h-4 w-4 text-green-400" />
                                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border border-green-500/40 uppercase font-semibold text-xs">MAP ACTIVE</Badge>
                                    </div>
                                    <h3 className="text-lg font-bold leading-none">Campus Map</h3>
                                    <p className="text-slate-400 text-sm">View parking zones and transit routes.</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-medium">System operational</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Map className="h-20 w-20 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
