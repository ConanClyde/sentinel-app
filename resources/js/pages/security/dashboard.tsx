import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Shield, AlertTriangle, Clock, Map, QrCode, FileText, PlusCircle, History, Radio, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

interface SecurityDashboardProps {
    patrolLogs?: any[];
    violations?: any[];
}

export default function SecurityDashboard({ patrolLogs = [], violations = [] }: SecurityDashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User;

    const totalPatrols = patrolLogs.length;
    const pendingViolations = violations.filter((v: any) => v.status === 'pending').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Security Dashboard" />

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
                    <p className="text-muted-foreground text-sm">Monitor campus security, conduct patrols, and manage violation reports.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-600">Patrols Completed</CardTitle>
                            <Radio className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{totalPatrols}</div>
                            <p className="text-xs text-muted-foreground mt-1">This shift</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-red-500/10 to-red-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600">Pending Reports</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{pendingViolations}</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-green-600">Shift Status</CardTitle>
                            <Clock className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">Active</div>
                            <p className="text-xs text-muted-foreground mt-1">On duty</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-purple-600">Officer ID</CardTitle>
                            <Shield className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-base sm:text-lg font-bold font-mono">SEC-{user.id.toString().padStart(5, '0')}</div>
                            <p className="text-xs text-muted-foreground mt-1">Security personnel</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Row */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-7">
                    {/* Recent Patrol Activity */}
                    <Card className="lg:col-span-4 border-muted/40 shadow-sm">
                        <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <Radio className="h-5 w-5 text-primary" />
                                Recent Patrol Activity
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Latest patrol logs and checkpoint scans from your shift.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {patrolLogs.length > 0 ? (
                                    patrolLogs.slice(0, 5).map((log: any) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-background flex items-center justify-center border shadow-sm shrink-0">
                                                    <Radio className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-sm truncate">{log.location || 'Checkpoint'}</span>
                                                    <span className="text-xs text-muted-foreground">{log.notes || 'Patrol check completed'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className={`border-none text-xs ${log.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                    {log.status || 'completed'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <Radio className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No patrol activity yet.</p>
                                        <p className="text-xs mt-1">Start your first patrol to see activity here.</p>
                                    </div>
                                )}
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
                                    <Link href={route('shared.map')}>
                                        <PlusCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">New Patrol</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3 sm:py-4 border-muted/50 hover:bg-background hover:shadow-sm active:scale-95 transition-transform" asChild>
                                    <Link href={route('shared.report-history')}>
                                        <FileText className="h-5 w-5 text-red-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">Report Violation</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3 sm:py-4 border-muted/50 hover:bg-background hover:shadow-sm active:scale-95 transition-transform" asChild>
                                    <Link href={route('shared.report-history')}>
                                        <History className="h-5 w-5 text-purple-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">Patrol History</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3 sm:py-4 border-muted/50 hover:bg-background hover:shadow-sm active:scale-95 transition-transform" asChild>
                                    <Link href={route('profile')}>
                                        <Shield className="h-5 w-5 text-amber-500" />
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
                                        <Map className="h-4 w-4 text-green-400" />
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/40 uppercase font-semibold text-xs">MAP ACTIVE</Badge>
                                    </div>
                                    <h3 className="text-lg font-bold leading-none">Campus Map</h3>
                                    <p className="text-slate-400 text-sm">View patrol routes and incident locations.</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-medium">System operational</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Shield className="h-20 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
