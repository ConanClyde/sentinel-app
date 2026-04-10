import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    Car, 
    Clock, 
    CheckCircle2, 
    ChevronRight, 
    ArrowUpRight,
    Search,
    UserPlus,
    FileText,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
    pending_registrations: number;
    total_users: number;
    total_vehicles: number;
    recent_activity: any[];
}

interface DashboardProps {
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

export default function AdminDashboard({ stats }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            
            <div className="flex flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, Admin</h1>
                    <p className="text-muted-foreground text-lg">Here's a summary of campus registration activity today.</p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                Pending Approvals
                            </CardTitle>
                            <Clock className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">{stats.pending_registrations}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                                <span className="text-orange-500">+2 since yesterday</span>
                            </p>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild 
                                className="absolute bottom-4 right-4 h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
                            >
                                <Link href={route('admin.pending-registrations.index')}>
                                    View all <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Registered Users
                            </CardTitle>
                            <Users className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">{stats.total_users}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">Verified active accounts</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                                Active Vehicles
                            </CardTitle>
                            <Car className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground">{stats.total_vehicles}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">With active stickers</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Activity Table */}
                    <Card className="lg:col-span-4 border-muted/40 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Submissions</CardTitle>
                            <CardDescription>The latest registration attempts requiring review.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.recent_activity.length > 0 ? (
                                    stats.recent_activity.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm shrink-0">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-foreground truncate">{item.first_name} {item.surname}</span>
                                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{item.role_type?.name || 'User'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={`${item.status === 'pending' ? 'bg-orange-500/10 text-orange-600' : 'bg-green-500/10 text-green-600'} border-none`}>
                                                    {item.status}
                                                </Badge>
                                                <Button size="icon" variant="ghost" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Link href={route('admin.pending-registrations.show', { id: item.id })}>
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>No pending registrations to show.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Tools Section */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02]">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Tools</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                                    <Link href={route('admin.pending-registrations.index')}>
                                        < ShieldAlert className="h-5 w-5 text-orange-500" />
                                        <span className="text-xs font-semibold uppercase tracking-tight">Approvals</span>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm">
                                    <Search className="h-5 w-5 text-blue-500" />
                                    <span className="text-xs font-semibold uppercase tracking-tight">Search</span>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm">
                                    <UserPlus className="h-5 w-5 text-green-500" />
                                    <span className="text-xs font-semibold uppercase tracking-tight">Add User</span>
                                </Button>
                                <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm">
                                    <FileText className="h-5 w-5 text-purple-500" />
                                    <span className="text-xs font-semibold uppercase tracking-tight">Reports</span>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-slate-900 text-white overflow-hidden relative shadow-lg">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold leading-none">Security Status</h3>
                                    <p className="text-slate-400 text-sm">Main Campus Perimeter</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-medium">All systems green</span>
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
