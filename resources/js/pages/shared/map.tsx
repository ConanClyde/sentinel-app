import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { 
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
} from '@/components/modal-drawer';
import { 
    Navigation, 
    Radio,
    LocateFixed, 
    ZoomIn,
    ZoomOut,
    MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
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
    description: string | null;
    type_id: number;
    vertices: Vertex[];
    center_x: number;
    center_y: number;
    color: string | null;
    is_active: boolean;
    sticker_path?: string | null;
    type?: MapLocationType;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Campus Map', href: route('shared.map') },
];

/** `campus-map.svg` viewBox — `<img>` intrinsic size is unreliable when the SVG uses width/height %. */
const CAMPUS_MAP_ASPECT = 5500 / 4000;

export default function SharedCampusMap() {
    const isMobile = useIsMobile();
    const [locations, setLocations] = useState<MapLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Viewport Logic (pan handled by library)
    const [zoom, setZoom] = useState(1);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const targetZoomRef = useRef(1);
    const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    useEffect(() => {
        fetch(route('shared.api.map.locations'))
            .then(res => res.json())
            .then(data => {
                setLocations(data);
                setLoading(false);
            })
            .catch(err => console.error('Failed to load map data:', err));
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

    // Map container will follow CAMPUS_MAP_ASPECT, so inner content matches container scale
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

    // Polygon points: vertices are % (0-100), SVG viewBox is 0 0 100 100
    const getPolygonPoints = (vertices: Vertex[]) =>
        vertices.map(v => `${v.x},${v.y}`).join(' ');

    // Inverse scale so labels stay same visual size regardless of zoom
    const labelScale = 1 / zoom;

    const panCount = useRef(0);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs} fullWidth={isMobile}>
            <Head title="Sentinel Map" />

            <div className="flex flex-col gap-4 lg:gap-6 lg:min-h-[calc(100vh-12rem)]">
                {!isMobile && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-0">
                        <div className="flex flex-col gap-1.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Sentinel Map
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Real-time campus infrastructure overview and zone monitoring.
                            </p>
                        </div>
                    </div>
                )}

                {/* Map Interface (Full Width) */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 lg:gap-6 lg:flex-1 min-h-0">
                    <Card
                        className={cn(
                            'flex flex-col overflow-hidden',
                            isMobile && 'rounded-none border-x-0 border-t-0 bg-transparent'
                        )}
                    >
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
                                        <div className="relative h-full w-full">
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
                                                {locations.map(loc => {
                                                    const color = loc.color || loc.type?.default_color || '#3b82f6';
                                                    const isSelected = selectedLocation?.id === loc.id;
                                                    return (
                                                        <g
                                                            key={loc.id}
                                                            className="group/node cursor-pointer"
                                                            onClick={(e) => {
                                                                if (panCount.current > 5) return;
                                                                setSelectedLocation(loc);
                                                            }}
                                                        >
                                                            <polygon
                                                                points={getPolygonPoints(loc.vertices)}
                                                                fill={color}
                                                                fillOpacity={0.45}
                                                                className={cn(
                                                                    "transition-all duration-300",
                                                                    isSelected ? "opacity-100" : "opacity-0 md:group-hover/node:opacity-100"
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
                                                                className="pointer-events-none select-none opacity-80"
                                                            >
                                                                {loc.short_code}
                                                            </text>
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    </TransformComponent>

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

                                    {loading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-30">
                                            <Radio className="h-10 w-10 text-primary mb-4 animate-ping" />
                                            <h3 className="text-lg font-semibold">Loading Map...</h3>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TransformWrapper>
                    </Card>
                </div>
            </div>

            {/* Location Detail Drawer (Mobile Native Parity) */}
            <ModalDrawer
                open={!!selectedLocation}
                onOpenChange={(v) => {
                    if (!v) setSelectedLocation(null);
                }}
            >
                <ModalDrawerContent className="flex min-h-0 w-full max-w-full max-h-[95dvh] flex-col !gap-0 !p-0 !pt-0 !overflow-hidden sm:max-h-[90vh] sm:max-w-xl">
                    <div className="shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between">
                        <div className="space-y-1 text-left">
                            <ModalDrawerTitle>
                                {selectedLocation?.name}
                            </ModalDrawerTitle>
                            <ModalDrawerDescription className="text-[11px] text-muted-foreground font-medium">
                                Detailed reconnaissance and zone monitoring protocol.
                            </ModalDrawerDescription>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 shadow-sm">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: selectedLocation?.color || selectedLocation?.type?.default_color || '#000' }}
                                    />
                                    <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500">
                                        {selectedLocation?.type?.name}
                                    </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono font-bold tracking-tight">
                                    SECTOR {selectedLocation?.short_code}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div className="min-h-0 flex-1 bg-muted/20 px-6 py-6 flex flex-col gap-6 overflow-y-auto overscroll-contain">
                            
                            {/* Map Preview (Accuracy Fix) */}
                            <div className="relative w-full aspect-[5.5/4] rounded-2xl overflow-hidden border bg-card shadow-inner shrink-0 scale-95 origin-center">
                                <img
                                    src="/storage/images/map/campus-map.svg"
                                    alt="Map"
                                    className="block h-full w-full object-cover opacity-30 grayscale"
                                />
                                <svg
                                    className="absolute inset-0 h-full w-full"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    {selectedLocation && (
                                        <polygon
                                            points={getPolygonPoints(selectedLocation.vertices)}
                                            fill={`${selectedLocation.color || selectedLocation.type?.default_color || '#3b82f6'}cc`}
                                        />
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-t from-black/20 to-transparent">
                                    <Badge variant="secondary" className="bg-white/90 text-black shadow-lg text-[10px] font-black uppercase tracking-widest">
                                        Zone Highlight
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Zone Identity</Label>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Name</p>
                                            <p className="font-semibold text-sm">{selectedLocation?.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Short Code</p>
                                                <p className="font-mono font-bold text-lg">{selectedLocation?.short_code}</p>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Zone Type</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div
                                                        className="w-3 h-3 rounded-full shadow-sm"
                                                        style={{ background: selectedLocation?.color || selectedLocation?.type?.default_color || '#000' }}
                                                    />
                                                    <p className="text-sm font-medium">{selectedLocation?.type?.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ModalDrawerFooter className="mt-0 shrink-0 gap-2 border-t bg-muted/5 px-6 py-4 flex flex-row items-center sm:justify-end">
                        <Button 
                            className="w-full sm:w-auto px-8"
                            onClick={() => setSelectedLocation(null)}
                        >
                            Dismiss
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
