import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Clock, MapPin, Search, FileSearch, TrendingUp, ZoomIn, ZoomOut, LocateFixed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { format } from 'date-fns';
import { UserAvatar } from '@/components/user-avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { clampMapWheelPosition, type ZoomPinchRefLike } from '@/lib/map-transform-bounds';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patrol Monitor', href: route('admin.patrol.index') },
];

interface MapLocation {
    id: number;
    name: string;
    short_code: string;
    vertices: { x: number; y: number }[];
    center_x: number;
    center_y: number;
    color: string | null;
    type?: {
        name: string;
        default_color: string;
    };
}

interface PatrolLog {
    id: number;
    security_user_id: number;
    map_location_id: number;
    checked_in_at: string;
    notes: string | null;
    security_user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    location: {
        id: number;
        name: string;
        short_code: string;
    };
}

interface PaginatedData {
    data: PatrolLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function PatrolMonitor({ 
    patrolLogs, 
    mapLocations = [],
    patrolFrequency = {}
}: { 
    patrolLogs: PaginatedData;
    mapLocations: MapLocation[];
    patrolFrequency: Record<number, number>;
}) {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState('');
    
    // Viewport Logic (pan handled by library)
    const [zoom, setZoom] = useState(1);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const targetZoomRef = useRef(1);
    const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const panCount = useRef(0);

    // Smooth wheel zoom anchored to cursor position
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

            // Mouse position relative to the container element
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Compute new pan so that the point under the cursor stays fixed
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

    // Track container dimensions so we can compute contain-fit size
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

    // Map container dimensions
    const innerDims = useMemo(() => {
        if (containerSize.w <= 0 || containerSize.h <= 0) return null;
        return { w: containerSize.w, h: containerSize.h };
    }, [containerSize.w, containerSize.h]);

    useLayoutEffect(() => {
        if (!innerDims) return;
        let id1 = 0;
        let id2 = 0;
        id1 = requestAnimationFrame(() => {
            id2 = requestAnimationFrame(() => {
                const ref = transformRef.current;
                if (ref) ref.centerView(ref.state.scale, 0, 'linear');
            });
        });
        return () => {
            cancelAnimationFrame(id1);
            cancelAnimationFrame(id2);
        };
    }, [innerDims?.w, innerDims?.h, containerSize.w, containerSize.h]);

    const filteredLogs = patrolLogs.data.filter(log =>
        log.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.location.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.security_user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toString().includes(searchQuery)
    );

    // Calculate heatmap intensity (0-1 scale)
    const maxFrequency = Math.max(...Object.values(patrolFrequency), 1);
    const getHeatmapIntensity = (locationId: number) => {
        const freq = patrolFrequency[locationId] || 0;
        return freq / maxFrequency;
    };

    // Get heatmap color based on intensity
    const getHeatmapColor = (intensity: number) => {
        if (intensity === 0) return 'rgba(59, 130, 246, 0.1)'; // Very light blue for no patrols
        if (intensity < 0.25) return 'rgba(34, 197, 94, 0.3)'; // Light green
        if (intensity < 0.5) return 'rgba(234, 179, 8, 0.4)'; // Yellow
        if (intensity < 0.75) return 'rgba(249, 115, 22, 0.5)'; // Orange
        return 'rgba(239, 68, 68, 0.6)'; // Red for highest activity
    };

    // Top patrolled locations
    const topLocations = useMemo(() => {
        return Object.entries(patrolFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([locationId, count]) => {
                const location = mapLocations.find(l => l.id === parseInt(locationId));
                return { location, count };
            })
            .filter(item => item.location);
    }, [patrolFrequency, mapLocations]);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs} fullWidth={isMobile}>
            <Head title="Patrol Monitor" />

            <div className="flex flex-col gap-4 sm:gap-6">
                {/* Header - Hidden on mobile */}
                {!isMobile && (
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-2xl font-bold tracking-tight">Patrol Monitor</h1>
                        <p className="text-muted-foreground text-sm">Real-time monitoring of security patrol check-ins and activity heatmap across all patrol points.</p>
                    </div>
                )}

                {/* Heatmap Section */}
                <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "md:grid-cols-3"
                )}>
                    {/* Map Heatmap */}
                    <Card className={cn(
                        "flex flex-col overflow-hidden",
                        isMobile ? "rounded-none border-x-0 border-t-0 bg-transparent shadow-none" : "md:col-span-2"
                    )}>
                        {!isMobile && (
                            <div className="p-4 pb-0">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-1">Patrol Activity Heatmap</h3>
                                <p className="text-xs text-muted-foreground">Visual representation of patrol frequency across campus zones (drag to pan, scroll to zoom)</p>
                            </div>
                        )}
                        <TransformWrapper
                            ref={transformRef}
                            initialScale={1}
                            minScale={1}
                            maxScale={8}
                            centerOnInit={true}
                            disablePadding
                            limitToBounds={true}
                            smooth
                            panning={{
                                excluded: ['button', 'map-pan-exclude'],
                            }}
                            pinch={{ disabled: false, allowPanning: true }}
                            doubleClick={{ disabled: true }}
                            wheel={{ disabled: true }}
                            onPanningStart={() => { panCount.current = 0; }}
                            onPanning={() => { panCount.current++; }}
                            onTransform={(_r, state) => setZoom(state.scale)}
                        >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <div
                                    ref={containerRef}
                                    className={cn(
                                        'relative overflow-hidden touch-none cursor-grab active:cursor-grabbing w-full aspect-[5.5/4]',
                                        isMobile ? 'min-h-0' : 'lg:flex-1',
                                    )}
                                >
                                    <TransformComponent
                                        wrapperClass="!h-full !w-full !max-w-none min-w-0"
                                        wrapperStyle={{ width: '100%', height: '100%' }}
                                        contentClass="!block !max-w-none !max-h-none"
                                        contentStyle={
                                            innerDims
                                                ? {
                                                      width: innerDims.w,
                                                      height: innerDims.h,
                                                      display: 'block',
                                                  }
                                                : { width: '100%', height: '100%', display: 'block' }
                                        }
                                    >
                                        <div className="relative w-full h-full">
                                            <img
                                                ref={imgRef}
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
                                                {mapLocations.map((loc) => {
                                                    if (!loc.vertices || loc.vertices.length === 0) return null;
                                                    const intensity = getHeatmapIntensity(loc.id);
                                                    const heatColor = getHeatmapColor(intensity);
                                                    const count = patrolFrequency[loc.id] || 0;
                                                    
                                                    return (
                                                        <g key={loc.id}>
                                                            <polygon
                                                                points={loc.vertices.map((v) => `${v.x},${v.y}`).join(' ')}
                                                                fill={heatColor}
                                                                stroke={intensity > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}
                                                                strokeWidth="0.2"
                                                                className="transition-all duration-200"
                                                            />
                                                            {loc.center_x && loc.center_y && (
                                                                <>
                                                                    <text
                                                                        x={loc.center_x}
                                                                        y={loc.center_y - 0.5}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        fontSize={1.2}
                                                                        fill="#1e293b"
                                                                        fontWeight="700"
                                                                        className="pointer-events-none select-none"
                                                                    >
                                                                        {loc.short_code}
                                                                    </text>
                                                                    {count > 0 && (
                                                                        <text
                                                                            x={loc.center_x}
                                                                            y={loc.center_y + 1}
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                            fontSize={0.8}
                                                                            fill="#ef4444"
                                                                            fontWeight="900"
                                                                            className="pointer-events-none select-none"
                                                                        >
                                                                            {count}
                                                                        </text>
                                                                    )}
                                                                </>
                                                            )}
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    </TransformComponent>

                                    {/* Map Control Buttons */}
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
                                </div>
                            )}
                        </TransformWrapper>
                        {/* Legend */}
                        {!isMobile && (
                            <div className="p-4 pt-3 flex items-center gap-4 text-xs">
                                <span className="font-semibold text-muted-foreground">Activity Level:</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }} />
                                    <span className="text-muted-foreground">None</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }} />
                                    <span className="text-muted-foreground">Low</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.5)' }} />
                                    <span className="text-muted-foreground">Medium</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.6)' }} />
                                    <span className="text-muted-foreground">High</span>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Top Patrolled Locations - Hidden on mobile */}
                    {!isMobile && (
                        <Card className="p-4">
                            <div className="mb-3">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Top Locations
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">Most frequently patrolled zones</p>
                            </div>
                            <div className="space-y-2">
                                {topLocations.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">No patrol data yet</p>
                                ) : (
                                    topLocations.map(({ location, count }, index) => (
                                        <div key={location?.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold">{location?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{location?.short_code}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                                                {count}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Mobile Top Locations Section */}
                {isMobile && topLocations.length > 0 && (
                    <Card className="p-4 rounded-none border-x-0 bg-transparent">
                        <div className="mb-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Top Patrolled Locations
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {topLocations.slice(0, 3).map(({ location, count }, index) => (
                                <div key={location?.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{location?.name}</div>
                                            <div className="text-xs text-muted-foreground">{location?.short_code}</div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                                        {count}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search patrol logs..."
                        className="bg-card focus:ring-primary/20 border-zinc-200 pl-9 shadow-sm dark:border-zinc-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Desktop Table View */}
                <div className="rounded-lg border bg-card overflow-x-auto hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Officer</TableHead>
                                <TableHead className="font-semibold">Location</TableHead>
                                <TableHead className="font-semibold">Check-in Time</TableHead>
                                <TableHead className="font-semibold">Notes</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <FileSearch className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">No patrol logs found</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {searchQuery ? 'Adjust your search or wait for patrol activity.' : 'No patrol check-ins have been recorded yet.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <UserAvatar user={log.security_user ?? null} size="sm" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{log.security_user?.name ?? 'Unknown'}</span>
                                                    <span className="text-muted-foreground text-[10px]">{log.security_user?.role ?? 'N/A'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{log.location.name}</div>
                                                    <div className="text-xs text-muted-foreground">{log.location.short_code}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(log.checked_in_at), 'MMM dd, yyyy')}</span>
                                                <span className="text-xs">{format(new Date(log.checked_in_at), 'h:mm a')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                {log.notes || '—'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]">
                                                VERIFIED
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                    {filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileSearch className="h-10 w-10 text-muted-foreground/30 mb-4" />
                            <h3 className="text-sm font-semibold tracking-tight">No patrol logs found</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {searchQuery ? 'Adjust your search.' : 'No patrol check-ins have been recorded yet.'}
                            </p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="rounded-lg border bg-card p-4 mb-2">
                                <div className="flex items-start gap-3 mb-3">
                                    <UserAvatar user={log.security_user ?? null} size="sm" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm mb-0.5">{log.security_user?.name ?? 'Unknown'}</div>
                                        <div className="text-xs text-muted-foreground mb-2">{log.security_user?.role ?? 'N/A'}</div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1 rounded-md font-semibold px-2 py-0.5">
                                            VERIFIED
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <div>
                                            <div className="font-medium text-foreground">{log.location.name}</div>
                                            <div className="text-xs">{log.location.short_code}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-3 w-3 shrink-0" />
                                        <div className="text-xs">
                                            <div>{format(new Date(log.checked_in_at), 'MMM dd, yyyy')}</div>
                                            <div>{format(new Date(log.checked_in_at), 'h:mm a')}</div>
                                        </div>
                                    </div>

                                    {log.notes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-muted-foreground">{log.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
