import { useForm, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
} from '@/components/modal-drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
    Navigation,
    Trash2,
    Save,
    Undo2,
    LocateFixed,
    Pencil,
    MoreHorizontal,
    QrCode,
    ZoomIn,
    ZoomOut,
    Eye,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { clampMapWheelPosition, type ZoomPinchRefLike } from '@/lib/map-transform-bounds';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Vertex {
    x: number;
    y: number;
}

interface MapLocationType {
    id: number;
    name: string;
    default_color: string;
    icon: string;
}

interface MapLocation {
    id: number;
    name: string;
    short_code: string;
    type_id: number;
    vertices: Vertex[];
    center_x: number;
    center_y: number;
    color: string | null;
    is_active: boolean;
    sticker_path?: string | null;
    type?: MapLocationType;
}

interface Props {
    locations: MapLocation[];
    locationTypes: MapLocationType[];
}

interface MapLocationForm {
    name: string;
    short_code: string;
    type_id: string;
    vertices: Vertex[];
    center_x: number;
    center_y: number;
    color: string;
    [key: string]: any;
}

/** `campus-map.svg` viewBox — `<img>` naturalWidth/Height are unreliable when the SVG uses width/height %. */
const CAMPUS_MAP_ASPECT = 5500 / 4000;

export function CampusMapSection({ locations, locationTypes }: Props) {
    const isMobile = useIsMobile();
    const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
    const [currentVertices, setCurrentVertices] = useState<Vertex[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewingLocation, setViewingLocation] = useState<MapLocation | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [zoom, setZoom] = useState(1);

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const overlayRef = useRef<SVGSVGElement | null>(null);
    const pointerStartPos = useRef({ x: 0, y: 0 });
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const targetZoomRef = useRef(1);
    const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [draggingVertexIndex, setDraggingVertexIndex] = useState<number | null>(null);

    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !drawerOpen) return;
        const ro = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [drawerOpen]);

    // Map container will follow CAMPUS_MAP_ASPECT, so inner content matches container scale
    const innerDims = useMemo(() => {
        if (containerSize.w <= 0 || containerSize.h <= 0) return null;
        return { w: containerSize.w, h: containerSize.h };
    }, [containerSize.w, containerSize.h]);

    // Library init + centerOnInit run once while innerDims may still be null (100% placeholder). Recenter after real cover size exists.
    useLayoutEffect(() => {
        if (!drawerOpen || !innerDims) return;
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
    }, [drawerOpen, innerDims?.w, innerDims?.h, containerSize.w, containerSize.h]);

    /*
     * Wheel zoom: window capture + non-passive so it wins over (1) inner overflow-y scroll, (2) mobile Sheet overflow,
     * (3) dialog/body scroll chaining. Only when pointer is over the map surface (containerRef).
     */
    useEffect(() => {
        if (!drawerOpen) return;

        const handleWheel = (e: WheelEvent) => {
            const container = containerRef.current;
            if (!container?.isConnected) return;
            const t = e.target;
            if (t instanceof Node && !container.contains(t)) return;

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

        const opts: AddEventListenerOptions = { passive: false, capture: true };
        window.addEventListener('wheel', handleWheel, opts);
        return () => window.removeEventListener('wheel', handleWheel, opts);
    }, [drawerOpen, innerDims]);

    const { data, setData, post, put, processing, errors, reset } = useForm<MapLocationForm>({
        name: '',
        short_code: '',
        type_id: '',
        vertices: [],
        center_x: 50,
        center_y: 50,
        color: '',
    });

    const handleVertexPointerDown = useCallback((e: React.PointerEvent, index: number) => {
        e.stopPropagation();
        (e.nativeEvent as PointerEvent).stopImmediatePropagation();
        e.preventDefault();
        setDraggingVertexIndex(index);
        containerRef.current?.setPointerCapture(e.pointerId);
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!drawerOpen) return;
        pointerStartPos.current = { x: e.clientX, y: e.clientY };
    }, [drawerOpen]);

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (draggingVertexIndex === null || !overlayRef.current) return;
            const rect = overlayRef.current.getBoundingClientRect();
            const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
            const newVertex = {
                x: Math.max(0, Math.min(100, parseFloat(xPercent.toFixed(2)))),
                y: Math.max(0, Math.min(100, parseFloat(yPercent.toFixed(2)))),
            };

            setCurrentVertices((prev) => {
                const next = [...prev];
                next[draggingVertexIndex] = newVertex;
                return next;
            });
        },
        [draggingVertexIndex],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);

            if (drawerOpen && draggingVertexIndex === null) {
                const dist = Math.hypot(e.clientX - pointerStartPos.current.x, e.clientY - pointerStartPos.current.y);
                if (dist < 5 && overlayRef.current) {
                    const target = e.target as Element;
                    const skipVertex =
                        target.closest('button') ||
                        target.closest('[data-skip-map-vertex]') ||
                        target.hasAttribute('data-vertex-index');
                    if (!skipVertex) {
                        const rect = overlayRef.current.getBoundingClientRect();
                        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
                        const newVertex = {
                            x: parseFloat(xPercent.toFixed(2)),
                            y: parseFloat(yPercent.toFixed(2)),
                        };
                        setCurrentVertices((prev) => [...prev, newVertex]);
                    }
                }
            }

            setDraggingVertexIndex(null);
        },
        [drawerOpen, draggingVertexIndex],
    );

    useEffect(() => {
        if (!drawerOpen) return;

        let centerX = 0;
        let centerY = 0;
        if (currentVertices.length > 0) {
            centerX = currentVertices.reduce((sum, v) => sum + v.x, 0) / currentVertices.length;
            centerY = currentVertices.reduce((sum, v) => sum + v.y, 0) / currentVertices.length;
        }

        setData((prev) => ({
            ...prev,
            vertices: currentVertices,
            center_x: centerX,
            center_y: centerY,
        }));
    }, [currentVertices, drawerOpen, setData]);

    const undoVertex = () => {
        setCurrentVertices((prev) => prev.slice(0, -1));
    };

    const handleSave = () => {
        if (selectedLocation) {
            put(route('admin.config.map.locations.update', selectedLocation.id), {
                onSuccess: () => {
                    setDrawerOpen(false);
                    reset();
                    setSelectedLocation(null);
                    setCurrentVertices([]);
                },
            });
        } else {
            post(route('admin.config.map.locations.store'), {
                onSuccess: () => {
                    setDrawerOpen(false);
                    setCurrentVertices([]);
                    reset();
                    setSelectedLocation(null);
                },
            });
        }
    };

    const resetDrawerLocalState = () => {
        reset();
        setCurrentVertices([]);
        setSelectedLocation(null);
        setZoom(1);
    };

    const openDrawerForNew = () => {
        setSelectedLocation(null);
        setCurrentVertices([]);
        reset();
        setDrawerOpen(true);
    };

    const openView = (loc: MapLocation) => {
        setViewingLocation(loc);
        setIsViewOpen(true);
    };

    const selectForEdit = (loc: MapLocation) => {
        setSelectedLocation(loc);
        setData({
            name: loc.name,
            short_code: loc.short_code,
            type_id: loc.type_id.toString(),
            vertices: loc.vertices,
            center_x: loc.center_x,
            center_y: loc.center_y,
            color: loc.color || '',
        });
        setCurrentVertices(loc.vertices || []);
        setDrawerOpen(true);
    };

    const getPolygonPoints = (vertices: Vertex[]) => vertices.map((v) => `${v.x},${v.y}`).join(' ');

    const labelScale = 1 / zoom;

    const isEditingPolygon = (loc: MapLocation) => selectedLocation?.id === loc.id && drawerOpen;

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'campus-map') {
            openDrawerForNew();
            sessionStorage.removeItem('openModal');
        }
    }, []);

    return (
        <div className="flex flex-col gap-4 lg:gap-6 lg:min-h-[calc(100vh-14rem)]">
            <Card className="border-white/10 bg-muted/5 flex flex-col overflow-hidden w-full">
                <ScrollArea className="w-full max-h-[min(50vh,520px)] border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Code</TableHead>
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locations.map((loc) => (
                                <TableRow
                                    key={loc.id}
                                    className={cn(
                                        'group hover:bg-muted/50',
                                        selectedLocation?.id === loc.id ? 'bg-muted' : '',
                                    )}
                                >
                                    <TableCell className="font-medium py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ background: loc.color || loc.type?.default_color || '#3b82f6' }}
                                            />
                                            <span className="text-xs">{loc.short_code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 max-w-[140px]">
                                        <p className="text-sm truncate" title={loc.name}>
                                            {loc.name}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right py-3 pr-4">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenuItem onSelect={() => openView(loc)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() => window.open(route('admin.config.map.locations.sticker', loc.id), '_blank')}
                                                >
                                                    <QrCode className="h-4 w-4 mr-2" /> Download Sticker
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => selectForEdit(loc)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() => {
                                                        setDeleteId(loc.id);
                                                    }}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {locations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No zones configured.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </Card>

            <ModalDrawer
                open={isViewOpen}
                onOpenChange={(v) => {
                    setIsViewOpen(v);
                    if (!v) setViewingLocation(null);
                }}
            >
                <ModalDrawerContent className="flex min-h-0 w-full max-w-full max-h-[90dvh] flex-col !gap-0 !p-0 !pt-0 !overflow-hidden overflow-hidden sm:max-h-[90vh] sm:max-w-5xl">
                    <div className="shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <ModalDrawerTitle>{viewingLocation?.name}</ModalDrawerTitle>
                            <ModalDrawerDescription className="text-[11px] text-muted-foreground">
                                Detailed inspection and patrol protocol for this zone.
                            </ModalDrawerDescription>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 shadow-sm">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: viewingLocation?.color || viewingLocation?.type?.default_color || '#000' }}
                                    />
                                    <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500">
                                        {viewingLocation?.type?.name}
                                    </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono">{viewingLocation?.short_code}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div className="min-h-0 flex-1 bg-muted/20 px-6 py-4 flex flex-col gap-6 overflow-y-auto overscroll-contain">
                            {/* Map Preview */}
                            <div className="relative w-full aspect-[5.5/4] rounded-xl overflow-hidden border bg-card shadow-inner shrink-0 scale-95 origin-center">
                                <img
                                    src="/storage/images/map/campus-map.svg"
                                    alt="Map"
                                    className="block h-full w-full object-cover opacity-50 grayscale"
                                />
                                <svg
                                    className="absolute inset-0 h-full w-full"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    {viewingLocation && (
                                        <polygon
                                            points={getPolygonPoints(viewingLocation.vertices)}
                                            fill={`${viewingLocation.color || viewingLocation.type?.default_color || '#3b82f6'}90`}
                                        />
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-t from-black/40 to-transparent">
                                    <Badge variant="secondary" className="bg-white/90 text-black shadow-lg">Zone Highlight</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sticker Section */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Patrol Protocol Sticker</Label>
                                    <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/50 flex items-center justify-center p-8 overflow-hidden">
                                        {viewingLocation?.sticker_path ? (
                                            <img
                                                src={`/storage/${viewingLocation.sticker_path}`}
                                                className="w-full h-full object-contain drop-shadow-2xl transition-transform group-hover:scale-105"
                                                alt="Zone QR Sticker"
                                            />
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <QrCode className="w-12 h-12 mx-auto text-muted-foreground/20" />
                                                <p className="text-[10px] font-medium text-muted-foreground/60">No Sticker Generated</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                </div>

                                {/* Metadata Section */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Zone Identity</Label>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Name</p>
                                                <p className="font-semibold text-sm">{viewingLocation?.name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Short Code</p>
                                                    <p className="font-mono font-bold text-lg">{viewingLocation?.short_code}</p>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Zone Type</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div
                                                            className="w-3 h-3 rounded-full shadow-sm"
                                                            style={{ background: viewingLocation?.color || viewingLocation?.type?.default_color || '#000' }}
                                                        />
                                                        <p className="text-sm font-medium">{viewingLocation?.type?.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                        <p className="text-[11px] text-orange-600 font-medium leading-relaxed">
                                            Zone configuration is active and mapped to the patrol network. Scan the QR code to verify biometric check-in integration.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ModalDrawerFooter className="mt-0 shrink-0 gap-2 border-t bg-muted/5 px-6 py-4 flex flex-row items-center sm:justify-end">
                        <Button variant="outline" className="flex-1 sm:flex-none border-dashed" onClick={() => setIsViewOpen(false)}>
                            Close Viewer
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1 sm:flex-none"
                            onClick={() => {
                                if (viewingLocation) {
                                    window.open(route('admin.config.map.locations.sticker', viewingLocation.id), '_blank');
                                }
                            }}
                        >
                            <Download className="mr-2 h-4 w-4" /> Sticker
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            <ModalDrawer
                open={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) resetDrawerLocalState();
                }}
            >
                <ModalDrawerContent className="flex min-h-0 w-full max-w-full max-h-[90dvh] flex-col !gap-0 !p-0 !pt-0 !overflow-hidden overflow-hidden sm:max-h-[90vh] sm:max-w-5xl [&>button]:z-50">
                    {/* Mobile: plain title strip — not SheetHeader — so the map block is clearly separate from “header” chrome */}
                    {isMobile ? (
                        <div className="shrink-0 border-b bg-background px-6 pb-4 pt-0 text-left">
                            <ModalDrawerTitle className="text-left">
                                {selectedLocation ? 'Edit zone' : 'Add zone'}
                            </ModalDrawerTitle>
                        </div>
                    ) : (
                        <ModalDrawerHeader className="mb-0 shrink-0 border-b bg-background px-6 pb-4 pt-0 text-left sm:pt-4">
                            <ModalDrawerTitle>{selectedLocation ? 'Edit zone' : 'Add zone'}</ModalDrawerTitle>
                        </ModalDrawerHeader>
                    )}

                    {/* Body: desktop = one scroll column; mobile = sheet-style column (map flex-grows, form scrolls). */}
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div
                            className={cn(
                                'min-h-0 flex-1 bg-muted/20 px-6 py-4',
                                isMobile
                                    ? 'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain'
                                    : 'space-y-4 overflow-y-auto overscroll-contain',
                            )}
                        >
                            <ModalDrawerDescription className="text-left text-muted-foreground shrink-0">
                                Click the map to add vertices (minimum three). Drag red handles to adjust. Fill in name,
                                code, and type, then commit.
                            </ModalDrawerDescription>
                            <div className="flex shrink-0 items-center gap-3">
                                <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">
                                    {currentVertices.length} {currentVertices.length === 1 ? 'vertex' : 'vertices'}
                                </Badge>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="h-9 w-9 rounded-full shadow-sm"
                                    onClick={undoVertex}
                                    disabled={currentVertices.length === 0}
                                >
                                    <Undo2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Mobile: edge-to-edge width + flex-1 so the map fills remaining sheet height. */}
                            <div
                                className={cn(
                                    'min-w-0',
                                    isMobile &&
                                        '-mx-6 flex min-h-0 w-[calc(100%+3rem)] max-w-none flex-none flex-col',
                                )}
                            >
                            <Card
                                className={cn(
                                    'relative min-w-0 overflow-hidden border bg-card shadow-inner',
                                    isMobile && 'flex min-h-0 flex-none flex-col rounded-none border-x-0 shadow-none sm:rounded-lg sm:border-x sm:shadow-inner',
                                )}
                            >
                                <TransformWrapper
                                    ref={transformRef}
                                    initialScale={1}
                                    minScale={1}
                                    maxScale={8}
                                    centerOnInit
                                    disablePadding
                                    limitToBounds
                                    smooth
                                    panning={{
                                        // Library concatenates ".wrapper ." + entry — attribute selectors like "[data-foo]" become invalid ".[data-foo]".
                                        excluded: ['button', 'map-pan-exclude'],
                                    }}
                                    doubleClick={{ disabled: true }}
                                    wheel={{ disabled: true }}
                                    pinch={{ disabled: false, allowPanning: true }}
                                    onTransform={(_ref, state) => setZoom(state.scale)}
                                >
                                    {({ zoomIn, zoomOut, resetTransform }) => (
                                        <div
                                            ref={containerRef}
                                            className={cn(
                                                'relative touch-none w-full cursor-crosshair overflow-hidden overscroll-contain aspect-[5.5/4]',
                                                isMobile ? 'flex min-h-0 min-w-full flex-none' : 'lg:flex-1',
                                            )}
                                            onPointerDown={handlePointerDown}
                                            onPointerMove={handlePointerMove}
                                            onPointerUp={handlePointerUp}
                                            onPointerCancel={handlePointerUp}
                                            onDragStart={(e) => e.preventDefault()}
                                        >
                                            <TransformComponent
                                                wrapperClass="!h-full !w-full !max-w-none min-w-0"
                                                wrapperStyle={{ width: '100%', height: '100%' }}
                                                // Content node must match map pixel size — if it stays 100%×100%, the library
                                                // measures the wrapper as "content" and centerOnInit letterboxes the real map.
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
                                                <div className="relative h-full w-full">
                                                    <img
                                                        ref={imgRef}
                                                        src="/storage/images/map/campus-map.svg"
                                                        alt="Campus Map"
                                                        className="pointer-events-none block h-full w-full select-none"
                                                        style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
                                                        draggable={false}
                                                    />

                                                    <svg
                                                        ref={overlayRef}
                                                        className="absolute inset-0 h-full w-full"
                                                        viewBox="0 0 100 100"
                                                        preserveAspectRatio="none"
                                                    >
                                                        {locations.map((loc) => {
                                                            const color = loc.color || loc.type?.default_color || '#3b82f6';
                                                            const verts = isEditingPolygon(loc) ? currentVertices : loc.vertices || [];
                                                            return (
                                                                <g key={loc.id} className="group/loc">
                                                                    <polygon
                                                                        points={getPolygonPoints(verts)}
                                                                        fill={`${color}60`}
                                                                        className={cn(
                                                                            'pointer-events-auto transition-all duration-300',
                                                                            isEditingPolygon(loc)
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0 md:group-hover/loc:opacity-100',
                                                                        )}
                                                                    />
                                                                    <text
                                                                        x={loc.center_x}
                                                                        y={loc.center_y}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        fontSize={1.5}
                                                                        fill="#1e293b"
                                                                        fontWeight="700"
                                                                        className="pointer-events-none select-none opacity-80 transition-opacity md:group-hover/loc:opacity-100"
                                                                    >
                                                                        {loc.short_code}
                                                                    </text>
                                                                </g>
                                                            );
                                                        })}

                                                        {currentVertices.length > 0 && (
                                                            <g>
                                                                <polygon
                                                                    points={getPolygonPoints(currentVertices)}
                                                                    fill={currentVertices.length >= 3 ? 'rgba(239, 68, 68, 0.15)' : 'none'}
                                                                    stroke="#ef4444"
                                                                    strokeWidth={0.5 * labelScale}
                                                                    strokeDasharray={`${2 * labelScale} ${labelScale}`}
                                                                    className="pointer-events-none animate-pulse"
                                                                />
                                                                {currentVertices.map((v, i) => (
                                                                    <g key={i}>
                                                                        <circle
                                                                            cx={v.x}
                                                                            cy={v.y}
                                                                            r={8 * labelScale}
                                                                            fill="transparent"
                                                                            style={{
                                                                                pointerEvents: 'all',
                                                                                cursor: 'move',
                                                                                touchAction: 'none',
                                                                            }}
                                                                            onPointerDown={(e) => handleVertexPointerDown(e, i)}
                                                                        />
                                                                        <circle
                                                                            cx={v.x}
                                                                            cy={v.y}
                                                                            r={0.8 * labelScale}
                                                                            fill="#ef4444"
                                                                            stroke="white"
                                                                            strokeWidth={0.2 * labelScale}
                                                                            className="pointer-events-none"
                                                                        />
                                                                    </g>
                                                                ))}
                                                            </g>
                                                        )}
                                                    </svg>
                                                </div>
                                            </TransformComponent>

                                            <div
                                                className="map-pan-exclude absolute bottom-6 left-6 flex flex-col gap-2 z-20"
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onPointerUp={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl border-0 bg-zinc-800 text-white shadow-xl hover:bg-zinc-900"
                                                    onClick={() => zoomIn(0.5)}
                                                >
                                                    <ZoomIn className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl border-0 bg-zinc-800 text-white shadow-xl hover:bg-zinc-900"
                                                    onClick={() => zoomOut(0.5)}
                                                >
                                                    <ZoomOut className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    className="h-10 w-10 rounded-xl border-0 bg-zinc-800 text-white shadow-xl hover:bg-zinc-900"
                                                    onClick={() => resetTransform()}
                                                >
                                                    <LocateFixed className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TransformWrapper>
                            </Card>
                            </div>

                            <div
                                className={cn(
                                    'space-y-4 border-t border-border/60 pt-4',
                                    isMobile &&
                                        'shrink-0',
                                )}
                            >
                                <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    placeholder="e.g. North Admin Parking"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Short Code</Label>
                                        {selectedLocation && (
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        placeholder="e.g. A1"
                                        value={data.short_code}
                                        onChange={(e) => setData('short_code', e.target.value.toUpperCase())}
                                        maxLength={5}
                                        disabled={!!selectedLocation}
                                        className={cn(!!selectedLocation && "bg-muted font-mono")}
                                    />
                                    {errors.short_code && <p className="text-xs text-red-500">{errors.short_code}</p>}
                                    {selectedLocation && (
                                        <p className="text-[10px] text-muted-foreground leading-tight">
                                            Identifier is permanent to maintain QR sticker integrity.
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={data.type_id} onValueChange={(v) => {
                                        const selectedType = locationTypes.find(t => t.id.toString() === v);
                                        setData('type_id', v);
                                        if (selectedType && !data.color) {
                                            setData('color', selectedType.default_color);
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locationTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ background: type.default_color }} />
                                                        {type.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type_id && <p className="text-xs text-red-500">{errors.type_id}</p>}
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ModalDrawerFooter className="mt-0 shrink-0 gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={processing || (data.vertices?.length ?? 0) < 3}>
                            Commit
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            <ModalDrawer open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Delete Location</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this location? This action cannot be undone.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <ModalDrawerFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
                        <Button
                            onClick={() => {
                                if (deleteId) {
                                    router.delete(route('admin.config.map.locations.destroy', deleteId));
                                    setDeleteId(null);
                                }
                            }}
                            className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                        >
                            Delete
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </div>
    );
}
