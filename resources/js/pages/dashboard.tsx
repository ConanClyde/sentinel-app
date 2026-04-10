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

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Welcome Section */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Authenticated Session
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">Welcome, {user.name}</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                        Your central command for identity management, vehicle transit authorization, and security protocols.
                    </p>
                </div>

                {/* Main Stats/Status Grid */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {/* Status Card */}
                    <Card className="border-muted/40 relative overflow-hidden group border-[1.5px]">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-110 duration-500">
                            <ShieldCheck className="h-28 w-28" />
                        </div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Security Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xl font-bold tracking-tight">Active Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter">
                                        Verified Resident
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sentinel ID Card */}
                    <Card className="border-muted/40 relative overflow-hidden group border-[1.5px]">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:-rotate-12 duration-500">
                            <QrCode className="h-28 w-28" />
                        </div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Digital Credentials</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-muted-foreground font-mono">ID SERIAL NUMBER</span>
                                <div className="text-3xl font-black text-foreground font-mono tracking-tighter">SNTL-{user.id.toString().padStart(5, '0')}</div>
                            </div>
                            <Button variant="outline" className="mt-4 w-full justify-between h-9 text-xs font-bold uppercase tracking-widest border-muted/60 hover:border-primary/50 group/btn">
                                Reveal Barcode
                                <QrCode className="h-3.5 w-3.5 group-hover/btn:text-primary transition-colors" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Vehicles Card */}
                    <Card className="border-muted/40 relative overflow-hidden group md:col-span-2 lg:col-span-1 border-[1.5px]">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transition-transform group-hover:translate-x-3 duration-500 text-primary">
                            <Car className="h-28 w-28" />
                        </div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Transit Authorization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-black text-foreground tracking-tighter">01</div>
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Sticker</span>
                            </div>
                            <Button variant="link" className="px-0 h-auto mt-4 text-primary font-black text-xs uppercase tracking-[0.15em] hover:no-underline hover:opacity-80 transition-all">
                                Manage Registry &rarr;
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Section */}
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-muted/40 border-[1.5px] overflow-hidden">
                            <CardHeader className="bg-muted/5 border-b border-muted/20 pb-4">
                                <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                        <UserIcon className="h-4 w-4 text-primary"/>
                                    </div>
                                    Identity Profile
                                </CardTitle>
                                <CardDescription className="text-xs">Your system-level identity and verified status.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid sm:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Full Name</span>
                                        <p className="text-lg font-bold tracking-tight">{user.name}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Primary Email</span>
                                        <p className="text-lg font-bold tracking-tight truncate">{user.email}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">System Permission Level</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-primary/10 text-primary border-none font-black text-[11px] uppercase tracking-tighter hover:bg-primary/20 transition-colors">
                                                {(user.role as string) || 'Standard Resident'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <Card className="border-muted/40 border-[1.5px]">
                            <CardHeader className="pb-3 text-center">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 px-6 pb-6">
                                <Button className="w-full justify-start h-11 font-bold tracking-tight rounded-xl group transition-all" variant="secondary">
                                    <Car className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    Register New Vehicle
                                </Button>
                                <Button className="w-full justify-start h-11 font-bold tracking-tight rounded-xl group transition-all" variant="outline">
                                    <UserIcon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    Update Profile Info
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="p-6 rounded-xl bg-muted/20 border border-dashed border-muted/60 flex flex-col items-center text-center gap-3">
                            <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-bold text-foreground">Need Assistance?</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Contact the campus security office for help with vehicle stickers or access issues.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
