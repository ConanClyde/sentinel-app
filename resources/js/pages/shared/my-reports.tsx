import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    MapPin,
    ShieldAlert,
    ImageIcon,
    FileSearch,
    Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ModalDrawer, ModalDrawerContent, ModalDrawerHeader, ModalDrawerTitle, ModalDrawerDescription, ModalDrawerFooter } from '@/components/modal-drawer';
import { format } from 'date-fns';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'My Reports', href: route('shared.my-reports') },
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

interface Violation {
    id: number;
    violation_type_id: number;
    description: string;
    location: string;
    status: 'pending' | 'approved' | 'rejected' | 'resolved' | string;
    reported_at: string;
    evidence_image: string | null;
    remarks: string | null;
    pin_x: number | null;
    pin_y: number | null;
    violator_sticker_number?: string;
    vehicle?: {
        plate_number: string | null;
        user?: {
            name: string;
        };
    };
    violation_type?: {
        name: string;
    };
    assignee?: {
        name: string;
    };
}

export default function MyReports({
    reports = [],
    stats = { totalCount: 0, unresolvedCount: 0, resolvedCount: 0 },
    reportsPagination,
}: {
    reports: Violation[],
    stats?: { totalCount: number; unresolvedCount: number; resolvedCount: number },
    reportsPagination?: { current_page: number; last_page: number; total: number },
}) {
    const { auth } = usePage().props as any;
    const userRole = auth.user.role;
    const [selectedReport, setSelectedReport] = useState<Violation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
    const [zoom, setZoom] = useState(1);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
    const [mapImageLoaded, setMapImageLoaded] = useState(false);
    const [didCenterOnPin, setDidCenterOnPin] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const mapImgRef = useRef<HTMLImageElement>(null);
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const lastCenteredKeyRef = useRef<string | null>(null);

    const { totalCount, unresolvedCount, resolvedCount } = stats;

    // Fetch map locations for accurate map display
    useEffect(() => {
        fetch(route('shared.api.map.locations'))
            .then(res => res.json())
            .then(data => setMapLocations(data))
            .catch(err => console.error('Failed to load map locations:', err));
    }, []);

    // Track container dimensions
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !selectedReport) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [selectedReport]);

    useEffect(() => {
        if (!selectedReport) return;
        setDidCenterOnPin(false);
        lastCenteredKeyRef.current = null;

        let raf1 = 0;
        let raf2 = 0;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                const el = containerRef.current;
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        setContainerSize({ w: rect.width, h: rect.height });
                    }
                }

                const img = mapImgRef.current;
                if (img?.complete) {
                    setMapImageLoaded(true);
                }
            });
        });

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [selectedReport?.id]);

    // Map container dimensions
    const innerDims = useMemo(() => {
        if (containerSize.w <= 0 || containerSize.h <= 0) return null;
        return { w: containerSize.w, h: containerSize.h };
    }, [containerSize.w, containerSize.h]);

    const normalizePin = useCallback((value: number) => {
        const v = Number(value);
        if (!Number.isFinite(v)) return null;
        const normalized = v <= 1 && v % 1 !== 0 ? v * 100 : v;
        return Math.max(0, Math.min(100, normalized));
    }, []);

    const normalizedPin = useMemo(() => {
        if (!selectedReport) return null;
        if (selectedReport.pin_x == null || selectedReport.pin_y == null) return null;
        const x = normalizePin(selectedReport.pin_x);
        const y = normalizePin(selectedReport.pin_y);
        if (x == null || y == null) return null;
        return { x, y };
    }, [normalizePin, selectedReport]);

    const initialMapTransform = useMemo(() => {
        if (!selectedReport) return null;
        if (selectedReport.pin_x == null || selectedReport.pin_y == null) return null;
        if (!innerDims) return null;

        const pin = normalizedPin;
        if (!pin) return null;

        const zoomLevel = 2.5;
        const pinPixelX = (pin.x / 100) * innerDims.w;
        const pinPixelY = (pin.y / 100) * innerDims.h;
        const centerX = innerDims.w / 2;
        const centerY = innerDims.h / 2;

        return {
            scale: zoomLevel,
            x: centerX - pinPixelX * zoomLevel,
            y: centerY - pinPixelY * zoomLevel,
            key: `${selectedReport.id}-${Math.round(innerDims.w)}x${Math.round(innerDims.h)}`,
        };
    }, [innerDims, normalizedPin, selectedReport]);

    useEffect(() => {
        if (!selectedReport) return;
        if (!mapImageLoaded) return;
        if (!normalizedPin) return;
        if (!innerDims) return;

        const ref = transformRef.current;
        if (!ref) return;

        const key = `${selectedReport.id}-${Math.round(innerDims.w)}x${Math.round(innerDims.h)}`;
        if (lastCenteredKeyRef.current === key) return;

        let raf1 = 0;
        let raf2 = 0;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                const scale = 2.5;
                const pinPixelX = (normalizedPin.x / 100) * innerDims.w;
                const pinPixelY = (normalizedPin.y / 100) * innerDims.h;
                const centerX = innerDims.w / 2;
                const centerY = innerDims.h / 2;
                const x = centerX - pinPixelX * scale;
                const y = centerY - pinPixelY * scale;

                ref.setTransform(x, y, scale, 0, 'linear');
                setZoom(scale);
                setDidCenterOnPin(true);
                lastCenteredKeyRef.current = key;
            });
        });

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [innerDims, mapImageLoaded, normalizedPin, selectedReport]);

    const mapReady = mapImageLoaded && didCenterOnPin;

    const filteredReports = reports.filter(r =>
        (r.vehicle?.plate_number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.violator_sticker_number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.id.toString().includes(searchQuery)
    );

    const selectedVehicleOwnerName = selectedReport?.vehicle?.user?.name;
    const selectedReportLocationName = selectedReport?.location;

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'pending': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><Clock className="h-3 w-3" /> PENDING</Badge>;
            case 'approved': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><CheckCircle2 className="h-3 w-3" /> APPROVED</Badge>;
            case 'rejected': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><XCircle className="h-3 w-3" /> REJECTED</Badge>;
            case 'resolved': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><CheckCircle2 className="h-3 w-3" /> RESOLVED</Badge>;
            default: return <Badge variant="outline" className="rounded-md font-semibold px-2 py-0.5 text-[10px]">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Reports" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
                    <p className="text-muted-foreground text-sm">Review your submitted reports and enforcement history.</p>
                </div>

                {/* Status Cards */}
                <div className="hidden md:grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Reports</span>
                            <span className="text-2xl font-bold">{totalCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-amber-500 tracking-widest">Pending</span>
                            <span className="text-2xl font-bold">{unresolvedCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-green-500 tracking-widest">Resolved</span>
                            <span className="text-2xl font-bold">{resolvedCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by plate, sticker, or report ID..."
                        className="bg-card border-zinc-200 pl-9 shadow-sm dark:border-zinc-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Desktop Table View */}
                <div className="rounded-lg border bg-card overflow-hidden hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Plate / Sticker</TableHead>
                                <TableHead className="font-semibold">Violator</TableHead>
                                <TableHead className="font-semibold">Location</TableHead>
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <FileSearch className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">No reports found</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Adjust your search or file a new incident report.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReports.map((report) => (
                                    <TableRow key={report.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-mono font-bold tracking-tight uppercase">
                                            {report.vehicle?.plate_number || report.violator_sticker_number || 'UNIDENTIFIED'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{report.vehicle?.user?.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{report.violation_type?.name || '---'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground">{report.location}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(report.reported_at), 'MMM dd, yyyy')}</span>
                                                <span className="text-xs">{format(new Date(report.reported_at), 'h:mm a')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => {
                                                setMapImageLoaded(false);
                                                setSelectedReport(report);
                                            }}>
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {filteredReports.length === 0 ? (
                        <div className="rounded-lg border bg-card p-12 text-center">
                            <div className="text-muted-foreground/40 flex flex-col items-center gap-2">
                                <FileSearch className="mb-2 h-10 w-10 stroke-[1]" />
                                <p className="text-sm font-semibold">No reports found</p>
                                <p className="text-xs">Adjust your search or file a new incident report.</p>
                            </div>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div key={report.id} className="rounded-lg border bg-card p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="font-mono font-bold tracking-tight uppercase text-base mb-1">
                                            {report.vehicle?.plate_number || report.violator_sticker_number || 'UNIDENTIFIED'}
                                        </div>
                                        <div className="text-sm font-medium mb-0.5">
                                            {report.vehicle?.user?.name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            {report.violation_type?.name || '---'}
                                        </div>
                                        <div className="mb-2">{getStatusBadge(report.status)}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 -mt-1" onClick={() => {
                                        setMapImageLoaded(false);
                                        setSelectedReport(report);
                                    }}>
                                        <Eye className="h-3.5 w-3.5" />
                                        View
                                    </Button>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="text-xs">{report.location}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span>{format(new Date(report.reported_at), 'MMM dd, yyyy')}</span>
                                            <span>{format(new Date(report.reported_at), 'h:mm a')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                {reportsPagination && reportsPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('shared.my-reports') + '?page=' + (reportsPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: reportsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('shared.my-reports') + '?page=' + page} isActive={reportsPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('shared.my-reports') + '?page=' + (reportsPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {reportsPagination && reportsPagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={route('shared.my-reports') + '?page=' + (reportsPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: reportsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('shared.my-reports') + '?page=' + page} isActive={reportsPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('shared.my-reports') + '?page=' + (reportsPagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Detail Modal */}
            <ModalDrawer
                open={!!selectedReport}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedReport(null);
                        setMapImageLoaded(false);
                        setDidCenterOnPin(false);
                    }
                }}
            >
                <ModalDrawerContent className="flex max-h-[80vh] flex-col !gap-0 overflow-hidden !p-0 !pt-0 sm:max-w-2xl [&>button]:z-50">
                    <ModalDrawerHeader className="bg-background sticky top-0 z-10 shrink-0 border-b px-6 pt-0 pb-4 sm:relative sm:pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            {selectedReport && getStatusBadge(selectedReport.status)}
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Incident Documentation</span>
                        </div>
                        <ModalDrawerTitle>Incident Summary</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Report details for {selectedReport?.vehicle?.plate_number || selectedReport?.violator_sticker_number || 'this violation'}
                            {selectedVehicleOwnerName ? ` - ${selectedVehicleOwnerName}` : ''}.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-6">
                        {/* Violation Info */}
                        <div className="space-y-3">
                            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Violation Info</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-xs">Violation Type</Label>
                                    <div className="font-medium">{selectedReport?.violation_type?.name || '---'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-xs">Plate Number</Label>
                                    <div className="font-mono font-bold tracking-tight uppercase">{selectedReport?.vehicle?.plate_number || selectedReport?.violator_sticker_number || '---'}</div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-muted-foreground text-xs">Location</Label>
                                    <div className="font-medium">{selectedReport?.location || '---'}</div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-muted-foreground text-xs">Description</Label>
                                    <div className="font-medium text-sm italic text-muted-foreground leading-relaxed">
                                        "{selectedReport?.description || 'No description provided.'}"
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Location */}
                        {normalizedPin && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Incident Location Map</p>
                                <div className="relative w-full aspect-[5.5/4] rounded-lg bg-muted/20 border overflow-hidden">
                                    <TransformWrapper
                                        key={initialMapTransform?.key ?? selectedReport?.id ?? 'no-report'}
                                        ref={transformRef}
                                        initialScale={initialMapTransform?.scale ?? 1}
                                        initialPositionX={initialMapTransform?.x}
                                        initialPositionY={initialMapTransform?.y}
                                        minScale={1}
                                        maxScale={8}
                                        centerOnInit={false}
                                        disablePadding={false}
                                        limitToBounds={false}
                                        smooth
                                        panning={{ disabled: true }}
                                        pinch={{ disabled: true }}
                                        doubleClick={{ disabled: true }}
                                        wheel={{ disabled: true }}
                                        onTransform={(_r, state) => setZoom(state.scale)}
                                    >
                                        {() => (
                                            <div
                                                ref={containerRef}
                                                className="relative w-full h-full overflow-hidden"
                                            >
                                                {!mapReady && (
                                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                                                        <div className="w-[70%] max-w-sm space-y-3">
                                                            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                                                            <div className="h-3 w-full rounded bg-muted animate-pulse" />
                                                            <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
                                                        </div>
                                                    </div>
                                                )}
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
                                                    <div className={`relative h-full w-full ${mapReady ? 'opacity-100' : 'opacity-0'}`}>
                                                        {/* Base map image */}
                                                        <img
                                                            ref={mapImgRef}
                                                            src="/storage/images/map/campus-map.svg"
                                                            alt="Campus Map"
                                                            className="block h-full w-full select-none pointer-events-none"
                                                            style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
                                                            draggable={false}
                                                            onLoad={() => setMapImageLoaded(true)}
                                                            onError={() => setMapImageLoaded(true)}
                                                        />
                                                        
                                                        {/* SVG overlay with zones and pin marker */}
                                                        <svg
                                                            className="absolute inset-0 w-full h-full"
                                                            viewBox="0 0 100 100"
                                                            preserveAspectRatio="none"
                                                        >
                                                            {/* Zone polygons */}
                                                            {mapLocations.map((loc) => {
                                                                if (!loc.vertices || loc.vertices.length === 0) return null;
                                                                const color = loc.color || loc.type?.default_color || '#3b82f6';
                                                                const isSelected = !!selectedReportLocationName && loc.name === selectedReportLocationName;
                                                                return (
                                                                    <g key={loc.id}>
                                                                        <polygon
                                                                            points={loc.vertices.map((v) => `${v.x},${v.y}`).join(' ')}
                                                                            fill={color}
                                                                            fillOpacity={isSelected ? 0.35 : 0}
                                                                            className="transition-all duration-200"
                                                                        />
                                                                        {/* Short code label */}
                                                                        {loc.center_x && loc.center_y && (
                                                                            <text
                                                                                x={loc.center_x}
                                                                                y={loc.center_y}
                                                                                textAnchor="middle"
                                                                                dominantBaseline="middle"
                                                                                fontSize={1.5}
                                                                                fill="#1e293b"
                                                                                fontWeight="700"
                                                                                className="pointer-events-none select-none opacity-80"
                                                                            >
                                                                                {loc.short_code}
                                                                            </text>
                                                                        )}
                                                                    </g>
                                                                );
                                                            })}

                                                            {/* Pin marker - scales inversely with zoom */}
                                                            <g transform={`translate(${normalizedPin.x}, ${normalizedPin.y}) scale(${0.6 / Math.pow(zoom, 0.6)})`}>
                                                                {/* Shadow */}
                                                                <ellipse cx="0" cy="2.5" rx="1.2" ry="0.5" fill="#000" fillOpacity={0.2} />
                                                                {/* Pin body - teardrop shape */}
                                                                <path
                                                                    d="M0,-4 C-1.8,-4 -2.5,-2.2 -2.5,-0.5 C-2.5,1.5 0,4 0,4 C0,4 2.5,1.5 2.5,-0.5 C2.5,-2.2 1.8,-4 0,-4 Z"
                                                                    fill="#ef4444"
                                                                    stroke="#fff"
                                                                    strokeWidth={0.3}
                                                                />
                                                                {/* Inner white circle */}
                                                                <circle cx="0" cy="-1.5" r="1" fill="#fff" />
                                                                {/* Pulse animation */}
                                                                <circle
                                                                    cx="0"
                                                                    cy="-1"
                                                                    r="3"
                                                                    fill="#ef4444"
                                                                    fillOpacity={0.3}
                                                                    className="animate-ping"
                                                                />
                                                            </g>
                                                        </svg>
                                                    </div>
                                                </TransformComponent>
                                            </div>
                                        )}
                                    </TransformWrapper>
                                </div>
                            </div>
                        )}

                        {/* Official Verdict */}
                        {selectedReport?.remarks && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Official Verdict</p>
                                <div className="p-4 rounded-lg bg-muted/30 border border-muted/20">
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        {selectedReport.remarks}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Evidence */}
                        <div className="space-y-3 border-t pt-4">
                            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Photographic Evidence</p>
                            <div className="aspect-video rounded-lg bg-muted/20 border overflow-hidden">
                                {selectedReport?.evidence_image ? (
                                    <img
                                        src={`/storage/${selectedReport.evidence_image}`}
                                        className="w-full h-full object-cover"
                                        alt="Evidence"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                                        <ImageIcon className="h-8 w-8" />
                                        No Visual Data
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <ModalDrawerFooter className="bg-muted/20 mt-0 shrink-0 border-t px-6 py-4">
                        <Button variant="outline" className="ml-auto w-full sm:w-auto" onClick={() => setSelectedReport(null)}>
                            Close
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
