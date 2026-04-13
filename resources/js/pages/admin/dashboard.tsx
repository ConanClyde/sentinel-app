import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Users, Car, Clock, CheckCircle2, ChevronRight, ArrowUpRight,
    FileText, ShieldAlert, Activity, Ticket, ZoomIn, ZoomOut, LocateFixed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useRef, useState, useEffect, useMemo } from 'react';
import { clampMapWheelPosition, type ZoomPinchRefLike } from '@/lib/map-transform-bounds';

interface Stats {
    pending_approvals: number;
    total_users: number;
    total_vehicles: number;
    total_violations: number;
    pending_violations: number;
    recent_activity: any[];
}

interface HeatPoint {
    location: string;
    pin_x: number;
    pin_y: number;
    location_count: number;
    max_count: number;
}

interface Charts {
    violations_by_status: { status: string; count: number }[];
    violations_by_type: { type: string; count: number }[];
    violations_trend: { month: string; count: number }[];
    incident_heatmap: HeatPoint[];
    college_distribution: { college: string; name: string; count: number }[];
}

interface DashboardProps {
    stats: Stats;
    charts: Charts;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: route('dashboard') }];

const STATUS_COLORS: Record<string, string> = {
    pending:  '#f59e0b',
    approved: '#3b82f6',
    resolved: '#22c55e',
    rejected: '#ef4444',
};

const TYPE_COLORS = [
    'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
    'var(--chart-4)', 'var(--chart-5)', '#a78bfa',
];

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

function heatColor(intensity: number) {
    const r = Math.round(intensity * 239 + (1 - intensity) * 34);
    const g = Math.round(intensity * 68 + (1 - intensity) * 197);
    const b = Math.round(intensity * 68 + (1 - intensity) * 94);
    return `rgb(${r},${g},${b})`;
}

function normalizePin(v: number) {
    return v <= 1 && v % 1 !== 0 ? v * 100 : v;
}

export default function AdminDashboard({ stats, charts }: DashboardProps) {
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const targetZoomRef = useRef(1);
    const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const panCount = useRef(0);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
    const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; count: number } | null>(null);

    const maxCount = charts.incident_heatmap.length;

    // Same wheel zoom logic as shared/map.tsx
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const ref = transformRef.current;
            if (!ref) return;
            const { scale, positionX, positionY } = ref.state;
            const direction = e.deltaY < 0 ? 1 : -1;
            const newScale = Math.max(1, Math.min(8, targetZoomRef.current * (1 + direction * 0.12)));
            targetZoomRef.current = newScale;
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const contentX = (mouseX - positionX) / scale;
            const contentY = (mouseY - positionY) / scale;
            let newPositionX = mouseX - contentX * newScale;
            let newPositionY = mouseY - contentY * newScale;
            const clamped = clampMapWheelPosition(ref as unknown as ZoomPinchRefLike, newPositionX, newPositionY, newScale);
            newPositionX = clamped.x;
            newPositionY = clamped.y;
            if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
            ref.setTransform(newPositionX, newPositionY, newScale, 150, 'easeOut');
            wheelTimerRef.current = setTimeout(() => {
                targetZoomRef.current = transformRef.current?.state.scale ?? 1;
            }, 400);
        };
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    // Track container size
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const innerDims = useMemo(() => {
        if (containerSize.w <= 0 || containerSize.h <= 0) return null;
        return { w: containerSize.w, h: containerSize.h };
    }, [containerSize.w, containerSize.h]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h1>
                    <p className="text-muted-foreground text-sm">Campus activity overview and analytics.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-orange-500/10 to-orange-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-orange-600">Pending Approvals</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.pending_approvals}</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-600">Registered Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_users}</div>
                            <p className="text-xs text-muted-foreground mt-1">Verified accounts</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-green-600">Active Vehicles</CardTitle>
                            <Car className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_vehicles}</div>
                            <p className="text-xs text-muted-foreground mt-1">With active stickers</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-red-500/10 to-red-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600">Total Violations</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_violations}</div>
                            <p className="text-xs text-muted-foreground mt-1">All time</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-amber-500/10 to-amber-500/5 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Reports</CardTitle>
                            <Activity className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.pending_violations}</div>
                            <p className="text-xs text-muted-foreground mt-1">Under review</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 1: Line + Pie */}
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
                                            <Cell key={i} fill={STATUS_COLORS[entry.status] ?? TYPE_COLORS[i % TYPE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2: Bar (by type) + Recent Activity */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                    <Card className="lg:col-span-4 border-muted/40 shadow-sm">
                        <CardHeader>
                            <CardTitle>By Violation Type</CardTitle>
                            <CardDescription>Top violation categories reported</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{ count: { label: 'Reports', color: 'var(--chart-2)' } }} className="h-[220px] w-full">
                                <BarChart data={charts.violations_by_type} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={110} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                        {charts.violations_by_type.map((_, i) => (
                                            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3 border-muted/40 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Submissions</CardTitle>
                            <CardDescription>Latest registration attempts requiring review.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.recent_activity.length > 0 ? (
                                    stats.recent_activity.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm shrink-0">
                                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-sm truncate">{item.first_name} {item.surname}</span>
                                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{item.role_type?.name || 'User'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`${item.status === 'pending' ? 'bg-orange-500/10 text-orange-600' : 'bg-green-500/10 text-green-600'} border-none text-xs`}>
                                                    {item.status}
                                                </Badge>
                                                <Button size="icon" variant="ghost" asChild className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                    <Link href={route('admin.pending-approvals.show', { id: item.id })}>
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No pending registrations.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* College Distribution */}
                <Card className="border-muted/40 shadow-sm">
                    <CardHeader>
                        <CardTitle>College Distribution</CardTitle>
                        <CardDescription>Number of registered students per college</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{ count: { label: 'Students', color: 'var(--chart-3)' } }} className="h-[220px] w-full">
                            <BarChart data={charts.college_distribution} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                <YAxis type="category" dataKey="college" tick={{ fontSize: 11 }} width={80} />
                                <ChartTooltip content={<ChartTooltipContent />} formatter={(value, name, props) => [value, props.payload?.name ?? name]} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {charts.college_distribution.map((_, i) => (
                                        <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Incident Hotspots — full width, exact map.tsx controls */}
                <Card className="border-muted/40 shadow-sm">
                    <CardHeader>
                        <CardTitle>Incident Hotspots</CardTitle>
                        <CardDescription>Geo-tagged incident locations on campus. Scroll to zoom, drag to pan, hover for details.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 overflow-hidden rounded-b-lg">
                        {charts.incident_heatmap.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground text-sm">
                                No geo-tagged incidents yet.
                            </div>
                        ) : (
                            <TransformWrapper
                                ref={transformRef}
                                initialScale={1}
                                minScale={1}
                                maxScale={8}
                                centerOnInit={true}
                                disablePadding
                                limitToBounds={true}
                                smooth
                                panning={{ excluded: ['button', 'map-pan-exclude'] }}
                                pinch={{ disabled: false, allowPanning: true }}
                                doubleClick={{ disabled: true }}
                                wheel={{ disabled: true }}
                                onPanningStart={() => { panCount.current = 0; }}
                                onPanning={() => { panCount.current++; }}
                            >
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <div
                                        ref={containerRef}
                                        className="relative overflow-hidden touch-none cursor-grab active:cursor-grabbing w-full aspect-[5.5/4]"
                                    >
                                        <TransformComponent
                                            wrapperClass="!h-full !w-full !max-w-none min-w-0"
                                            wrapperStyle={{ width: '100%', height: '100%' }}
                                            contentClass="!block !max-w-none !max-h-none"
                                            contentStyle={
                                                innerDims
                                                    ? { width: innerDims.w, height: innerDims.h, display: 'block' }
                                                    : { width: '100%', height: '100%', display: 'block' }
                                            }
                                        >
                                            <div className="relative h-full w-full">
                                                <img
                                                    src="/storage/images/map/campus-map.svg"
                                                    alt="Campus Map"
                                                    className="block h-full w-full select-none pointer-events-none"
                                                    style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
                                                    draggable={false}
                                                />
                                                <svg
                                                    className="absolute inset-0 w-full h-full"
                                                    viewBox="0 0 100 100"
                                                    preserveAspectRatio="none"
                                                >
                                                    {charts.incident_heatmap.map((item, i) => {
                                                        const intensity = (item.location_count - 1) / Math.max(item.max_count - 1, 1);
                                                        const x = normalizePin(item.pin_x);
                                                        const y = normalizePin(item.pin_y);
                                                        const color = heatColor(intensity);
                                                        return (
                                                            <g
                                                                key={i}
                                                                style={{ cursor: 'pointer' }}
                                                                onMouseEnter={(e) => {
                                                                    const rect = containerRef.current?.getBoundingClientRect();
                                                                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, label: item.location, count: 1 });
                                                                }}
                                                                onMouseLeave={() => setTooltip(null)}
                                                            >
                                                                <circle cx={x} cy={y} r={0.9} fill={color} fillOpacity={0.85} stroke="#fff" strokeWidth={0.25} />
                                                            </g>
                                                        );
                                                    })}
                                                </svg>

                                                {/* Hover tooltip */}
                                                {tooltip && (
                                                    <div
                                                        className="absolute z-50 pointer-events-none bg-background/95 border shadow-lg rounded-lg px-3 py-2 text-xs font-medium"
                                                        style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
                                                    >
                                                        <div className="font-semibold">{tooltip.label || 'Unknown location'}</div>
                                                        <div className="text-muted-foreground">1 incident</div>
                                                    </div>
                                                )}
                                            </div>
                                        </TransformComponent>

                                        {/* Zoom controls — exact same style as shared/map.tsx */}
                                        <div
                                            className="map-pan-exclude absolute bottom-6 left-6 flex flex-col gap-2 z-20"
                                            onPointerDown={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                size="icon"
                                                className="bg-zinc-800 hover:bg-zinc-900 text-white border-0 h-10 w-10 rounded-xl shadow-xl"
                                                onClick={() => zoomIn(0.5)}
                                            >
                                                <ZoomIn className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                className="bg-zinc-800 hover:bg-zinc-900 text-white border-0 h-10 w-10 rounded-xl shadow-xl"
                                                onClick={() => zoomOut(0.5)}
                                            >
                                                <ZoomOut className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                className="bg-zinc-800 hover:bg-zinc-900 text-white border-0 h-10 w-10 rounded-xl shadow-xl"
                                                onClick={() => resetTransform()}
                                            >
                                                <LocateFixed className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        {/* Legend */}
                                        <div className="map-pan-exclude absolute bottom-6 right-6 flex items-center gap-1.5 bg-zinc-800/90 backdrop-blur-sm rounded-xl px-3 py-2 text-[10px] font-semibold shadow-xl z-20">
                                            <span className="text-green-400">Low</span>
                                            <div className="w-16 h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgb(34,197,94), rgb(239,68,68))' }} />
                                            <span className="text-red-400">High</span>
                                        </div>
                                    </div>
                                )}
                            </TransformWrapper>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Tools */}
                <Card className="border-muted/40 shadow-sm bg-primary/[0.02]">
                    <CardHeader>
                        <CardTitle className="text-base">Quick Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                            <Link href={route('admin.pending-approvals.index')}>
                                <ShieldAlert className="h-5 w-5 text-orange-500" />
                                <span className="text-xs font-semibold uppercase tracking-tight">Approvals</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                            <Link href={route('admin.reports.index')}>
                                <ShieldAlert className="h-5 w-5 text-red-500" />
                                <span className="text-xs font-semibold uppercase tracking-tight">Reports</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                            <Link href={route('admin.registration.index')}>
                                <Users className="h-5 w-5 text-green-500" />
                                <span className="text-xs font-semibold uppercase tracking-tight">Register</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-auto flex-col gap-2 py-4 border-muted/50 hover:bg-background hover:shadow-sm" asChild>
                            <Link href={route('admin.stickers.index')}>
                                <Ticket className="h-5 w-5 text-purple-500" />
                                <span className="text-xs font-semibold uppercase tracking-tight">Stickers</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
