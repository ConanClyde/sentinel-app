import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
} from '@/components/modal-drawer';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CheckCircle2, Clock, Eye, Image as ImageIcon, Search, Send, Shield, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Security Ops', href: '#' },
    { title: 'Violation Reports', href: route('admin.reports.index') },
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
    reported_by: number;
    violator_vehicle_id: number | null;
    violator_sticker_number: string;
    violation_type_id: number;
    description: string;
    location: string;
    status: 'pending' | 'approved' | 'rejected' | 'resolved';
    reported_at: string;
    evidence_image: string | null;
    remarks: string | null;
    rejection_reason: string | null;
    pin_x: number | null;
    pin_y: number | null;
    vehicle?: {
        plate_number: string;
        user?: {
            name: string;
            role: string;
        };
    };
    violation_type?: {
        name: string;
    };
    reporter?: {
        name: string;
    };
    assignee?: {
        name: string;
    };
}

export default function Reports({
    violations = [],
    stats = { totalCount: 0, pendingCount: 0, approvedCount: 0, resolvedCount: 0, rejectedCount: 0 },
    vehicleOwnerRoles = [],
    canManage = false,
    reportsPagination,
}: {
    violations: Violation[];
    stats?: { totalCount: number; pendingCount: number; approvedCount: number; resolvedCount: number; rejectedCount: number };
    vehicleOwnerRoles?: { value: string; label: string }[];
    canManage?: boolean;
    reportsPagination?: { current_page: number; last_page: number; total: number };
}) {
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
    const [zoom, setZoom] = useState(1);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
    const [mapImageLoaded, setMapImageLoaded] = useState(false);
    const [didCenterOnPin, setDidCenterOnPin] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const mapImgRef = useRef<HTMLImageElement>(null);
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const lastCenteredKeyRef = useRef<string | null>(null);

    const { data, setData, put, reset, processing } = useForm({
        status: '',
        remarks: '',
        rejection_reason: '',
    });

    const { totalCount, pendingCount, approvedCount, resolvedCount, rejectedCount } = stats;

    // Fetch map locations for accurate map display
    useEffect(() => {
        fetch(route('shared.api.map.locations'))
            .then((res) => res.json())
            .then((data) => setMapLocations(data))
            .catch((err) => console.error('Failed to load map locations:', err));
    }, []);

    // Track container dimensions
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !selectedViolation) return;
        const ro = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [selectedViolation]);

    useEffect(() => {
        if (!selectedViolation) return;
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
    }, [selectedViolation?.id]);

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
        if (!selectedViolation) return null;
        if (selectedViolation.pin_x == null || selectedViolation.pin_y == null) return null;
        const x = normalizePin(selectedViolation.pin_x);
        const y = normalizePin(selectedViolation.pin_y);
        if (x == null || y == null) return null;
        return { x, y };
    }, [normalizePin, selectedViolation]);

    const initialMapTransform = useMemo(() => {
        if (!selectedViolation) return null;
        if (selectedViolation.pin_x == null || selectedViolation.pin_y == null) return null;
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
            key: `${selectedViolation.id}-${Math.round(innerDims.w)}x${Math.round(innerDims.h)}`,
        };
    }, [innerDims, normalizedPin, selectedViolation]);

    useEffect(() => {
        if (!selectedViolation) return;
        if (!mapImageLoaded) return;
        if (!normalizedPin) return;
        if (!innerDims) return;

        const ref = transformRef.current;
        if (!ref) return;

        const key = `${selectedViolation.id}-${Math.round(innerDims.w)}x${Math.round(innerDims.h)}`;
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
    }, [innerDims, mapImageLoaded, normalizedPin, selectedViolation]);

    const mapReady = mapImageLoaded && didCenterOnPin;

    const selectedViolationLocationName = selectedViolation?.location;

    const filteredViolations = violations.filter(
        (v) =>
            (roleFilter === 'all' || v.vehicle?.user?.role === roleFilter) &&
            (v.vehicle?.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.violator_sticker_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.vehicle?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.id.toString().includes(searchQuery)),
    );

    const handleUpdateStatus = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedViolation || !data.status) return;

        if (!isConfirmOpen) {
            setIsConfirmOpen(true);
            return;
        }

        put(route('violations.update-status', selectedViolation.id), {
            onSuccess: () => {
                setSelectedViolation(null);
                setIsConfirmOpen(false);
                reset();
            },
            onError: () => {
                setIsConfirmOpen(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 rounded-md border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500"
                    >
                        <Clock className="h-3 w-3" /> Pending Review
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 rounded-md border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500"
                    >
                        <CheckCircle2 className="h-3 w-3" /> Approved
                    </Badge>
                );
            case 'resolved':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 rounded-md border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-500"
                    >
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 rounded-md border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500"
                    >
                        <XCircle className="h-3 w-3" /> Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="rounded-md">
                        {status}
                    </Badge>
                );
        }
    };

    const isLocked = (status: string) => !canManage || status === 'rejected' || status === 'resolved';

    const getAvailableStatuses = (currentStatus: string): { value: string; label: string }[] => {
        switch (currentStatus) {
            case 'pending':
                return [
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                ];
            case 'approved':
                return [{ value: 'resolved', label: 'Resolved' }];
            default:
                return [];
        }
    };

    const openReview = (violation: Violation) => {
        setSelectedViolation(violation);
        setMapImageLoaded(false);
        setDidCenterOnPin(false);
        setData({
            status: '', // Require user to explicitly select a status
            remarks: violation.remarks || '',
            rejection_reason: violation.rejection_reason || '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Violation Management" />

            <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Incident Monitor</h1>
                    <p className="text-muted-foreground text-sm">Review and process incident and violation reports.</p>
                </div>

                {/* Status Cards */}
                <div className="hidden gap-4 md:grid md:grid-cols-5">
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Total Reports</span>
                            <span className="text-2xl font-bold">{totalCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-amber-500 uppercase">
                                <Clock className="h-3 w-3" /> Pending
                            </span>
                            <span className="text-2xl font-bold">{pendingCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-blue-500 uppercase">
                                <CheckCircle2 className="h-3 w-3" /> Approved
                            </span>
                            <span className="text-2xl font-bold">{approvedCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-green-500 uppercase">
                                <CheckCircle2 className="h-3 w-3" /> Resolved
                            </span>
                            <span className="text-2xl font-bold">{resolvedCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-red-500 uppercase">
                                <XCircle className="h-3 w-3" /> Rejected
                            </span>
                            <span className="text-2xl font-bold">{rejectedCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search by plate, sticker, name, reporter, or report ID..."
                                className="bg-card border-zinc-200 pl-9 shadow-sm dark:border-zinc-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="bg-card w-44 border-zinc-200 shadow-sm dark:border-zinc-800">
                                <SelectValue placeholder="All user types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All user types</SelectItem>
                                {vehicleOwnerRoles.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Desktop Table View */}
                    <Card className="border-muted/40 bg-card hidden overflow-hidden shadow-sm md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Plate / Sticker</TableHead>
                                    <TableHead className="font-semibold">Violator</TableHead>
                                    <TableHead className="font-semibold">Reporter</TableHead>
                                    <TableHead className="font-semibold">Location</TableHead>
                                    <TableHead className="font-semibold">Date</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredViolations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="text-muted-foreground/40 flex flex-col items-center gap-2">
                                                <Shield className="mb-2 h-10 w-10 stroke-[1]" />
                                                <p className="text-sm font-semibold">No incidents found</p>
                                                <p className="text-xs">Try adjusting your search or filter criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredViolations.map((v) => (
                                        <TableRow key={v.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-mono font-bold tracking-tight uppercase">
                                                {v.vehicle?.plate_number || v.violator_sticker_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{v.vehicle?.user?.name || 'Unknown'}</span>
                                                    <span className="text-muted-foreground text-xs">{v.violation_type?.name || '---'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground text-xs">{v.reporter?.name || 'Unknown'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground">{v.location}</span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(v.reported_at), 'MMM dd, yyyy')}</span>
                                                    <span className="text-xs">{format(new Date(v.reported_at), 'h:mm a')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(v.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-8 gap-1 ${isLocked(v.status) ? 'text-muted-foreground/50' : ''}`}
                                                    onClick={() => openReview(v)}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    {isLocked(v.status) ? 'View' : 'Review'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                        {filteredViolations.length === 0 ? (
                            <div className="bg-card rounded-lg border p-12 text-center">
                                <div className="text-muted-foreground/40 flex flex-col items-center gap-2">
                                    <Shield className="mb-2 h-10 w-10 stroke-[1]" />
                                    <p className="text-sm font-semibold">No incidents found</p>
                                    <p className="text-xs">Try adjusting your search or filter criteria.</p>
                                </div>
                            </div>
                        ) : (
                            filteredViolations.map((v) => (
                                <div key={v.id} className="bg-card rounded-lg border p-4">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 font-mono text-base font-bold tracking-tight uppercase">
                                                {v.vehicle?.plate_number || v.violator_sticker_number}
                                            </div>
                                            <div className="mb-0.5 text-sm font-medium">{v.vehicle?.user?.name || 'Unknown'}</div>
                                            <div className="text-muted-foreground mb-2 text-xs">{v.violation_type?.name || '---'}</div>
                                            <div className="mb-2">{getStatusBadge(v.status)}</div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`-mt-1 h-8 gap-1 ${isLocked(v.status) ? 'text-muted-foreground/50' : ''}`}
                                            onClick={() => openReview(v)}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            {isLocked(v.status) ? 'View' : 'Review'}
                                        </Button>
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <div className="text-muted-foreground flex items-center gap-1.5">
                                            <span className="text-xs">{v.location}</span>
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-1.5">
                                            <span className="text-xs">{v.reporter?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(v.reported_at), 'MMM dd, yyyy')}</span>
                                                <span>{format(new Date(v.reported_at), 'h:mm a')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                {reportsPagination && reportsPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('admin.reports.index') + '?page=' + (reportsPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: reportsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('admin.reports.index') + '?page=' + page} isActive={reportsPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('admin.reports.index') + '?page=' + (reportsPagination.current_page + 1)} />
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
                                <PaginationPrevious href={route('admin.reports.index') + '?page=' + (reportsPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: reportsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('admin.reports.index') + '?page=' + page} isActive={reportsPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('admin.reports.index') + '?page=' + (reportsPagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Review Modal */}
            <ModalDrawer
                open={!!selectedViolation}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedViolation(null);
                        setMapImageLoaded(false);
                        setDidCenterOnPin(false);
                    }
                }}
            >
                <ModalDrawerContent className="flex max-h-[80vh] flex-col !gap-0 overflow-hidden !p-0 !pt-0 sm:max-w-2xl [&>button]:z-50">
                    <ModalDrawerHeader className="bg-background sticky top-0 z-10 shrink-0 border-b px-6 pt-0 pb-4 sm:relative sm:pt-6">
                        <div className="mb-1 flex items-center gap-2">
                            {selectedViolation && getStatusBadge(selectedViolation.status)}
                            <span className="text-muted-foreground/60 text-[10px] font-black tracking-[0.3em] uppercase">Incident Documentation</span>
                        </div>
                        <ModalDrawerTitle>Incident Summary</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Report details for{' '}
                            {selectedViolation?.vehicle?.plate_number || selectedViolation?.violator_sticker_number || 'this violation'}
                            {selectedViolation?.vehicle?.user?.name && ` - ${selectedViolation.vehicle.user.name}`}.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>

                    {selectedViolation && (
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-6">
                                {/* Violation Info */}
                                <div className="space-y-3">
                                    <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Violation Info</p>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground text-xs">Violation Type</Label>
                                            <div className="font-medium">{selectedViolation.violation_type?.name || '---'}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground text-xs">Plate Number</Label>
                                            <div className="font-mono font-bold tracking-tight uppercase">
                                                {selectedViolation.vehicle?.plate_number || selectedViolation.violator_sticker_number || '---'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground text-xs">Location</Label>
                                            <div className="font-medium">{selectedViolation.location || '---'}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-muted-foreground text-xs">Reporter</Label>
                                            <div className="font-medium">{selectedViolation.reporter?.name || 'Unknown'}</div>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-muted-foreground text-xs">Description</Label>
                                            <div className="text-muted-foreground text-sm leading-relaxed font-medium italic">
                                                "{selectedViolation.description || 'No description provided.'}"
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Location */}
                                {normalizedPin && (
                                    <div className="space-y-3 border-t pt-4">
                                        <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                                            Incident Location Map
                                        </p>
                                        <div className="bg-muted/20 relative aspect-[5.5/4] w-full overflow-hidden rounded-lg border">
                                            <TransformWrapper
                                                key={initialMapTransform?.key ?? selectedViolation?.id ?? 'no-report'}
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
                                                    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
                                                        {!mapReady && (
                                                            <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
                                                                <div className="w-[70%] max-w-sm space-y-3">
                                                                    <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
                                                                    <div className="bg-muted h-3 w-full animate-pulse rounded" />
                                                                    <div className="bg-muted h-3 w-4/5 animate-pulse rounded" />
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
                                                                    className="pointer-events-none block h-full w-full select-none"
                                                                    style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
                                                                    draggable={false}
                                                                    onLoad={() => setMapImageLoaded(true)}
                                                                    onError={() => setMapImageLoaded(true)}
                                                                />

                                                                {/* SVG overlay with zones and pin marker */}
                                                                <svg
                                                                    className="absolute inset-0 h-full w-full"
                                                                    viewBox="0 0 100 100"
                                                                    preserveAspectRatio="none"
                                                                >
                                                                    {/* Zone polygons */}
                                                                    {mapLocations.map((loc) => {
                                                                        if (!loc.vertices || loc.vertices.length === 0) return null;
                                                                        const color = loc.color || loc.type?.default_color || '#3b82f6';
                                                                        const isSelected =
                                                                            !!selectedViolationLocationName &&
                                                                            loc.name === selectedViolationLocationName;
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
                                                                                        className="pointer-events-none opacity-80 select-none"
                                                                                    >
                                                                                        {loc.short_code}
                                                                                    </text>
                                                                                )}
                                                                            </g>
                                                                        );
                                                                    })}

                                                                    {/* Pin marker - scales inversely with zoom */}
                                                                    <g
                                                                        transform={`translate(${normalizedPin.x}, ${normalizedPin.y}) scale(${0.6 / Math.pow(zoom, 0.6)})`}
                                                                    >
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

                                {/* Evidence */}
                                <div className="space-y-3 border-t pt-4">
                                    <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Photographic Evidence</p>
                                    <div className="bg-muted/20 aspect-video overflow-hidden rounded-lg border">
                                        {selectedViolation.evidence_image ? (
                                            <img
                                                src={`/storage/${selectedViolation.evidence_image}`}
                                                className="h-full w-full object-cover"
                                                alt="Evidence"
                                            />
                                        ) : (
                                            <div className="text-muted-foreground/40 flex h-full flex-col items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                                                <ImageIcon className="h-8 w-8" />
                                                No Visual Data
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Update / Locked Section */}
                                <div className="space-y-4 border-t pt-4">
                                    <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Status Management</p>

                                    {isLocked(selectedViolation.status) ? (
                                        /* Read-only view for rejected / resolved */
                                        <div className="bg-muted/20 flex items-center gap-3 rounded-lg border px-4 py-3">
                                            <div className="flex-1">
                                                <p className="text-muted-foreground text-xs font-medium">
                                                    {selectedViolation.status === 'resolved'
                                                        ? 'This report has been resolved and is now closed.'
                                                        : 'This report was rejected and is now closed.'}
                                                </p>
                                                {selectedViolation.remarks && (
                                                    <p className="text-muted-foreground mt-2 border-t pt-2 text-xs italic">
                                                        <span className="font-semibold not-italic">Remarks:</span> {selectedViolation.remarks}
                                                    </p>
                                                )}
                                                {selectedViolation.rejection_reason && (
                                                    <p className="mt-1 text-xs text-red-400 italic">
                                                        <span className="font-semibold not-italic">Rejection reason:</span>{' '}
                                                        {selectedViolation.rejection_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Active form for pending / approved */
                                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground text-xs">
                                                    {selectedViolation.status === 'pending' ? 'Move to' : 'Next Status'}
                                                </Label>
                                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue placeholder="Select next status..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableStatuses(selectedViolation.status).map((s) => (
                                                            <SelectItem key={s.value} value={s.value}>
                                                                {s.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {data.status === 'rejected' && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-red-400">
                                                        Rejection Reason <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Textarea
                                                        value={data.rejection_reason}
                                                        onChange={(e) => setData('rejection_reason', e.target.value)}
                                                        className="min-h-[80px] resize-none"
                                                        placeholder="Explain why this report is being rejected..."
                                                        required
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground text-xs">
                                                    Remarks / Verdict <span className="text-muted-foreground font-normal">(optional)</span>
                                                </Label>
                                                <Textarea
                                                    value={data.remarks}
                                                    onChange={(e) => setData('remarks', e.target.value)}
                                                    className="min-h-[80px] resize-none"
                                                    placeholder="Document your verdict or required actions..."
                                                />
                                            </div>

                                            {/* Submit inside the form so Enter / button submits the inner form */}
                                            <div className="flex justify-end gap-2 pt-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full sm:w-auto"
                                                    onClick={() => setSelectedViolation(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={processing || !data.status} className="w-full gap-2 sm:w-auto">
                                                    {processing ? 'Processing...' : 'Update Status'}
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Footer: only Close for locked rows */}
                            {isLocked(selectedViolation.status) && (
                                <ModalDrawerFooter className="bg-muted/20 mt-0 shrink-0 border-t px-6 py-4">
                                    <Button variant="outline" className="w-full sm:ml-auto sm:w-auto" onClick={() => setSelectedViolation(null)}>
                                        Close
                                    </Button>
                                </ModalDrawerFooter>
                            )}
                        </div>
                    )}
                </ModalDrawerContent>
            </ModalDrawer>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to update this incident's status to{' '}
                            <span className="text-foreground font-bold">
                                {data.status === 'approved'
                                    ? 'Approved'
                                    : data.status === 'rejected'
                                      ? 'Rejected'
                                      : data.status === 'resolved'
                                        ? 'Resolved'
                                        : ''}
                            </span>
                            ?
                            {isLocked(data.status) && (
                                <p className="mt-2 font-semibold text-red-500">This action is final and will lock the report from further changes.</p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleUpdateStatus()}
                            className={cn(
                                data.status === 'rejected'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : data.status === 'resolved'
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : '',
                            )}
                        >
                            Confirm Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
