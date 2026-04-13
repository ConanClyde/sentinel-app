import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building2, Users, Car, ShieldAlert, Activity,
    ArrowUpRight, CheckCircle2, FileText, ChevronRight,
    Ticket, Receipt, GraduationCap, Briefcase, Shield, UserCheck
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
];

const STATUS_COLORS: Record<string, string> = {
    pending:  '#f59e0b',
    approved: '#3b82f6',
    resolved: '#22c55e',
    rejected: '#ef4444',
};

const trendConfig: ChartConfig = { count: { label: 'Violations', color: 'var(--chart-1)' } };
const statusConfig: ChartConfig = {
    pending:  { label: 'Pending',  color: '#f59e0b' },
    approved: { label: 'Approved', color: '#3b82f6' },
    resolved: { label: 'Resolved', color: '#22c55e' },
    rejected: { label: 'Rejected', color: '#ef4444' },
};

function formatMonth(m: string) {
    const [y, mo] = m.split('-');
    return new Date(Number(y), Number(mo) - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
}

interface Permissions {
    view_reports: boolean;
    view_vehicles: boolean;
    view_stickers: boolean;
    view_invoices: boolean;
    view_patrol: boolean;
    view_students: boolean;
    view_staff: boolean;
    view_stakeholders: boolean;
    view_security: boolean;
}

interface Props {
    deptName: string;
    stats: Record<string, number>;
    charts: {
        violations_trend?: { month: string; count: number }[];
        violations_by_status?: { status: string; count: number }[];
        recent_violations?: any[];
    };
    permissions: Permissions;
}

export default function DepartmentDashboard({ deptName, stats, charts, permissions }: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as any;

    const statCards = [
        permissions.view_reports && {
            key: 'total_violations', label: 'Total Violations', value: stats.total_violations,
            sub: 'All time', icon: ShieldAlert, color: 'red',
        },
        permissions.view_reports && {
            key: 'pending_violations', label: 'Pending Reports', value: stats.pending_violations,
            sub: 'Under review', icon: Activity, color: 'amber',
        },
        permissions.view_vehicles && {
            key: 'total_vehicles', label: 'Active Vehicles', value: stats.total_vehicles,
            sub: 'With active stickers', icon: Car, color: 'green',
        },
        permissions.view_stickers && {
            key: 'pending_sticker_requests', label: 'Sticker Requests', value: stats.pending_sticker_requests,
            sub: 'Pending', icon: Ticket, color: 'purple',
        },
        permissions.view_invoices && {
            key: 'pending_invoices', label: 'Pending Invoices', value: stats.pending_invoices,
            sub: 'Awaiting payment', icon: Receipt, color: 'orange',
        },
        permissions.view_patrol && {
            key: 'patrol_checkins_today', label: 'Patrol Check-ins', value: stats.patrol_checkins_today,
            sub: 'Today', icon: Shield, color: 'blue',
        },
        permissions.view_students && {
            key: 'total_students', label: 'Students', value: stats.total_students,
            sub: 'Registered', icon: GraduationCap, color: 'blue',
        },
        permissions.view_staff && {
            key: 'total_staff', label: 'Staff', value: stats.total_staff,
            sub: 'Registered', icon: Briefcase, color: 'green',
        },
        permissions.view_stakeholders && {
            key: 'total_stakeholders', label: 'Stakeholders', value: stats.total_stakeholders,
            sub: 'Registered', icon: UserCheck, color: 'purple',
        },
        permissions.view_security && {
            key: 'total_security', label: 'Security Personnel', value: stats.total_security,
            sub: 'Registered', icon: Shield, color: 'red',
        },
    ].filter(Boolean) as { key: string; label: string; value: number; sub: string; icon: any; color: string }[];

    const colorMap: Record<string, string> = {
        red:    'from-red-500/10 to-red-500/5 text-red-600',
        amber:  'from-amber-500/10 to-amber-500/5 text-amber-600',
        green:  'from-green-500/10 to-green-500/5 text-green-600',
        blue:   'from-blue-500/10 to-blue-500/5 text-blue-600',
        purple: 'from-purple-500/10 to-purple-500/5 text-purple-600',
        orange: 'from-orange-500/10 to-orange-500/5 text-orange-600',
    };

    const iconColorMap: Record<string, string> = {
        red: 'text-red-500', amber: 'text-amber-500', green: 'text-green-500',
        blue: 'text-blue-500', purple: 'text-purple-500', orange: 'text-orange-500',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Dashboard" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.first_name}</h1>
                    <p className="text-muted-foreground text-sm">{deptName} — campus activity overview.</p>
                </div>

                {/* Stat Cards */}
                {statCards.length > 0 && (
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {statCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Card key={card.key} className={`border-none bg-gradient-to-br ${colorMap[card.color]} shadow-sm hover:shadow-md transition-all`}>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className={`text-xs font-semibold uppercase tracking-wider ${colorMap[card.color].split(' ')[2]}`}>
                                            {card.label}
                                        </CardTitle>
                                        <Icon className={`h-4 w-4 ${iconColorMap[card.color]}`} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{card.value ?? '--'}</div>
                                        <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Charts — only if reports privilege */}
                {permissions.view_reports && charts.violations_trend && charts.violations_by_status && (
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                        <Card className="lg:col-span-4 border-muted/40 shadow-sm">
                            <CardHeader>
                                <CardTitle>Violations Trend</CardTitle>
                                <CardDescription>Monthly incident reports over the last 12 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={trendConfig} className="h-[220px] w-full">
                                    <LineChart data={charts.violations_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Line type="monotone" dataKey="count" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 border-muted/40 shadow-sm">
                            <CardHeader>
                                <CardTitle>By Status</CardTitle>
                                <CardDescription>Distribution of violation report statuses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={statusConfig} className="h-[220px] w-full">
                                    <PieChart>
                                        <Pie data={charts.violations_by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                            {charts.violations_by_status.map((entry, i) => (
                                                <Cell key={i} fill={STATUS_COLORS[entry.status] ?? 'var(--chart-1)'} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Bottom Row */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                    {permissions.view_reports && charts.recent_violations && (
                        <Card className="lg:col-span-4 border-muted/40 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Recent Violations</CardTitle>
                                    <CardDescription>Latest incident reports on campus.</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="text-xs">
                                    <Link href={route('admin.reports.index')}>View all <ChevronRight className="ml-1 h-3 w-3" /></Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {charts.recent_violations.length > 0 ? (
                                        charts.recent_violations.map((v: any) => (
                                            <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm shrink-0">
                                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-sm truncate">
                                                            {v.vehicle?.plate_number || v.violator_sticker_number || 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {v.violation_type?.name || '—'} · {v.location || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`border-none text-xs ${
                                                        v.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                                                        v.status === 'resolved' ? 'bg-green-500/10 text-green-600' :
                                                        v.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                                                        'bg-blue-500/10 text-blue-600'
                                                    }`}>
                                                        {v.status}
                                                    </Badge>
                                                    <Button size="icon" variant="ghost" asChild className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                        <Link href={route('admin.reports.index')}>
                                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No violations to show.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className={`${permissions.view_reports ? 'lg:col-span-3' : 'lg:col-span-7'} flex flex-col gap-6`}>
                        <Card className="border-muted/40 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    Department Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Officer</p>
                                    <p className="font-bold">{user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</p>
                                    <p className="font-bold">{deptName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Authority</p>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-primary/10 text-primary border-none font-semibold text-xs">Department Officer</Badge>
                                        <Badge variant="outline" className="text-xs">Validated</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02]">
                            <CardHeader>
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                {permissions.view_reports && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                        <Link href={route('admin.reports.index')}>
                                            <ShieldAlert className="h-5 w-5 text-red-500" />
                                            <span className="text-xs font-semibold uppercase tracking-tight">Reports</span>
                                        </Link>
                                    </Button>
                                )}
                                {permissions.view_vehicles && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                        <Link href={route('shared.vehicles')}>
                                            <Car className="h-5 w-5 text-green-500" />
                                            <span className="text-xs font-semibold uppercase tracking-tight">Vehicles</span>
                                        </Link>
                                    </Button>
                                )}
                                {(permissions.view_students || permissions.view_staff || permissions.view_stakeholders || permissions.view_security) && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                        <Link href={route('admin.users.index')}>
                                            <Users className="h-5 w-5 text-blue-500" />
                                            <span className="text-xs font-semibold uppercase tracking-tight">Users</span>
                                        </Link>
                                    </Button>
                                )}
                                {permissions.view_patrol && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                        <Link href={route('admin.patrol.index')}>
                                            <Activity className="h-5 w-5 text-purple-500" />
                                            <span className="text-xs font-semibold uppercase tracking-tight">Patrol</span>
                                        </Link>
                                    </Button>
                                )}
                                {permissions.view_stickers && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                        <Link href={route('admin.stickers.index')}>
                                            <Ticket className="h-5 w-5 text-purple-500" />
                                            <span className="text-xs font-semibold uppercase tracking-tight">Stickers</span>
                                        </Link>
                                    </Button>
                                )}
                                {permissions.view_invoices && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                        <Link href={route('admin.invoices.index')}>
                                            <Receipt className="h-5 w-5 text-orange-500" />
                                            <span className="text-xs font-semibold uppercase tracking-tight">Invoices</span>
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
