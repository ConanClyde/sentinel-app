import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    FileText,
    Clock,
    CheckCircle2,
    ChevronRight,
    ArrowUpRight,
    PlusCircle,
    BarChart,
    ShieldAlert,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

export default function ReporterDashboard({ stats, recentReports = [] }: { stats: { total: number, pending: number }, recentReports: any[] }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporter Dashboard" />

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, Reporter</h1>
                    <p className="text-muted-foreground text-sm">Document and manage campus violations to maintain community safety.</p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Total Reports
                            </CardTitle>
                            <FileText className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">{stats.total || '--'}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Submitted violations</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                Pending Review
                            </CardTitle>
                            <Clock className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">{stats.pending || '--'}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                                <span className="text-muted-foreground">Under verification</span>
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="absolute bottom-4 right-4 h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
                            >
                                <Link href={route('shared.my-reports')}>
                                    View all <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                                Reporter ID
                            </CardTitle>
                            <ShieldAlert className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">{user.id.toString().padStart(6, '0')}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Active status</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Reports Table */}
                    <Card className="md:col-span-2 lg:col-span-4 border-muted/40 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Reports</CardTitle>
                            <CardDescription>Your latest violation submissions and their status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentReports.length > 0 ? (
                                    recentReports.map((report) => (
                                        <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm shrink-0">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-foreground truncate">#{report.id} - {report.vehicle?.plate_number || report.violator_sticker_number}</span>
                                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{report.violation_type?.name || 'Violation'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={cn(
                                                    "border-none",
                                                    report.status === 'resolved' ? 'bg-green-500/10 text-green-600' :
                                                    report.status === 'dismissed' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-orange-500/10 text-orange-600'
                                                )}>
                                                    {report.status}
                                                </Badge>
                                                <Button size="icon" variant="ghost" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Link href={route('shared.my-reports')}>
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>No reports to show.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Section */}
                    <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4 sm:gap-6">
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02]">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                    <Link href={route('shared.report')}>
                                        <PlusCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">New Report</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                    <Link href={route('shared.my-reports')}>
                                        <BarChart className="h-5 w-5 text-blue-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">My Reports</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                    <Link href={route('shared.report-history')}>
                                        <FileText className="h-5 w-5 text-purple-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">History</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <span className="text-xs font-semibold uppercase tracking-tight">Guidelines</span>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-slate-900 text-white overflow-hidden relative shadow-lg">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold leading-none">Reporter Status</h3>
                                    <p className="text-slate-400 text-sm">Campus Safety Division</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-medium">Active reporting</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ShieldAlert className="h-20 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
