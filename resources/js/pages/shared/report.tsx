import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    Camera,
    FileText,
    Eye,
    ChevronRight,
    Upload,
    Search,
    CheckCircle2,
    ShieldAlert,
    ArrowLeft,
    RefreshCw,
    X,
    Scan,
    Loader2,
    ImageIcon,
    Send,
    Hash,
    ShieldCheck,
    CarFront,
    Car,
    Keyboard,
    ZoomIn,
    ZoomOut,
    Navigation,
    LocateFixed,
    MapPin
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { Scanner, type IScannerProps } from '@yudiel/react-qr-scanner';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { clampMapWheelPosition, type ZoomPinchRefLike } from '@/lib/map-transform-bounds';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import axios from 'axios';
import { CameraCaptureDialog } from '@/components/camera-capture-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operations', href: '#' },
    { title: 'Transmit Report', href: route('shared.report') },
];

type Step = 'INIT' | 'SCAN' | 'MANUAL' | 'VERIFY' | 'CONFIRM' | 'FORM';

interface ViolationType {
    id: number;
    name: string;
}

interface StickerColor {
    id: number;
    name: string;
    hex_code: string;
}

interface MapLocation {
    id: number;
    name: string;
    short_code: string;
    center_x: number;
    center_y: number;
    color: string;
    vertices: { x: number; y: number }[] | null;
    type?: {
        name: string;
        default_color: string;
    };
}

interface ReportProps {
    auth: any;
    violationTypes: ViolationType[];
    stickerColors: StickerColor[];
    mapLocations: MapLocation[];
    reporterTypeName: string;
}

interface IdentifiedVehicle {
    status: 'found' | 'not_found';
    vehicle: {
        id: number;
        plate_number: string;
        sticker_number: string;
        vehicle_type: { name: string };
        sticker_color: { name: string; hex_code: string };
    };
    owner: {
        name: string;
        role: string;
        avatar?: string;
    };
}

export default function Report({ auth, violationTypes, stickerColors, mapLocations, reporterTypeName }: ReportProps) {
    const [step, setStep] = useState<Step>('INIT');
    const [identifiedVehicle, setIdentifiedVehicle] = useState<IdentifiedVehicle | null>(null);
    const [manualPlate, setManualPlate] = useState('');
    const [manualSticker, setManualSticker] = useState('');
    const [manualStickerColorId, setManualStickerColorId] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isIdentifying, setIsIdentifying] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: '',
        plate_number: '',
        violation_type_id: '',
        location: '',
        pin_x: null as number | null,
        pin_y: null as number | null,
        description: '',
        evidence_image: null as File | null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cameraPaused, setCameraPaused] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);

    // Map state for pin placement
    const isMobile = useIsMobile();
    const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const targetZoomRef = useRef(1);
    const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);

    // Memoize map locations to prevent re-renders on zoom
    const mapLocationsMemo = useMemo(() => mapLocations, [mapLocations]);

    // Point-in-polygon detection
    const isPointInPolygon = (x: number, y: number, vertices: { x: number; y: number }[]): boolean => {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;
            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    };

    // Detect which zone the pin is in - smart detection with nearest zone fallback
    const detectZone = (x: number, y: number): string => {
        // First, check if pin is inside any zone
        for (const loc of mapLocationsMemo) {
            if (loc.vertices && loc.vertices.length > 0 && isPointInPolygon(x, y, loc.vertices)) {
                return loc.name;
            }
        }

        // If not inside any zone, find the nearest zone based on center coordinates
        let nearestZone = '';
        let minDistance = Infinity;

        for (const loc of mapLocationsMemo) {
            if (loc.center_x !== undefined && loc.center_y !== undefined) {
                const dx = x - loc.center_x;
                const dy = y - loc.center_y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestZone = loc.name;
                }
            }
        }

        return nearestZone;
    };

    // Handle pointer down - track drag start
    const handlePointerDown = (e: React.PointerEvent) => {
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = false;
    };

    // Handle pointer move - detect dragging
    const handlePointerMove = (e: React.PointerEvent) => {
        if (dragStartRef.current) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                isDraggingRef.current = true;
            }
        }
    };

    // Handle pointer up - place pin only if not dragging
    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDraggingRef.current) {
            dragStartRef.current = null;
            return;
        }

        const ref = transformRef.current;
        if (!ref) return;

        const { scale, positionX, positionY } = ref.state;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Use rect dimensions directly
        const containerW = rect.width;
        const containerH = rect.height;

        // Get click position relative to container
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert to map coordinates (0-100 range)
        const mapX = ((clickX - positionX) / scale) / containerW * 100;
        const mapY = ((clickY - positionY) / scale) / containerH * 100;

        setPinPosition({ x: mapX, y: mapY });
        const zone = detectZone(mapX, mapY);
        setData('location', zone);
        setData('pin_x', mapX);
        setData('pin_y', mapY);
        dragStartRef.current = null;
    };

    // Smooth wheel zoom anchored to cursor position
    useEffect(() => {
        // Only attach wheel handler when form is visible
        if (step !== 'FORM') return;

        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

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
    }, [step, containerSize.w, containerSize.h]);

    // Track container dimensions
    useEffect(() => {
        // Only track when form is visible
        if (step !== 'FORM') return;

        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setContainerSize({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [step]);

    // Map container dimensions
    const innerDims = useMemo(() => {
        if (containerSize.w <= 0 || containerSize.h <= 0) return null;
        return { w: containerSize.w, h: containerSize.h };
    }, [containerSize.w, containerSize.h]);

    useLayoutEffect(() => {
        // Only center when form is visible
        if (step !== 'FORM') return;
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
    }, [step, innerDims?.w, innerDims?.h, containerSize.w, containerSize.h]);

    const startScanner = () => {
        setIsScanning(true);
        setCameraPaused(false);
    };

    const stopScanner = () => {
        setIsScanning(false);
    };

    const handleScan = (result: any) => {
        if (!result || !result[0]?.rawValue) return;

        const decodedText = result[0].rawValue;
        stopScanner();
        toast.success(`Identity Detected: ${decodedText}`);
        handleIdentify({ plate_number: decodedText });
    };

    const handleCameraCapture = (file: File) => {
        setData('evidence_image', file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        toast.success('Photo captured successfully.');
    };

    useEffect(() => {
        if (step === 'SCAN') {
            startScanner();
        } else {
            stopScanner();
        }
    }, [step]);

    const handleIdentify = async (params: { plate_number?: string; sticker_number?: string; sticker_color_id?: string }) => {
        if (isIdentifying) return;

        setIsIdentifying(true);
        setStep('VERIFY');

        try {
            const response = await axios.get(route('shared.identify'), { params });

            // Defer updates to a fresh tick to resolve React 19 / Inertia 2.0 transition conflicts
            setTimeout(() => {
                if (response.data.status === 'found') {
                    // SBO restriction: can only report student vehicle owners
                    const isSBO = reporterTypeName.toUpperCase().includes('SBO');
                    const ownerRole = response.data.owner?.role ?? '';
                    if (isSBO && ownerRole !== 'Student') {
                        toast.error('As an SBO reporter, you can only report violations for student vehicle owners.');
                        setStep('INIT');
                        setIsIdentifying(false);
                        return;
                    }

                    setIdentifiedVehicle(response.data);
                    setData('vehicle_id', response.data.vehicle.id.toString());
                    setData('plate_number', response.data.vehicle.plate_number);
                    setStep('FORM');
                } else {
                    toast.error("Identification failed. Please try manual entry.");
                    setStep('MANUAL');
                }
                setIsIdentifying(false);
            }, 0);

        } catch (error) {
            setTimeout(() => {
                toast.error("Connection lost. Please try again.");
                setStep('MANUAL');
                setIsIdentifying(false);
            }, 0);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('evidence_image', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('violations.store'), {
            onSuccess: () => {
                reset();
                setStep('INIT');
                setIdentifiedVehicle(null);
                setPreviewUrl(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth={step === 'SCAN'}>
            <Head title="Report Violation" />

            <div className={cn(
                "mx-auto flex flex-col pb-20 transition-all duration-500",
                step === 'SCAN' ? "max-w-full lg:px-0 gap-0" : "max-w-4xl gap-4 sm:gap-6"
            )}>
                {/* Header Section */}
                <div className={cn(
                    "flex items-start gap-4 transition-all duration-500",
                    step === 'SCAN'
                        ? "opacity-0 -translate-y-4 pointer-events-none"
                        : "opacity-100 translate-y-0 px-0 py-0"
                )}>
                    {step !== 'INIT' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 mt-1 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors shrink-0"
                            onClick={() => setStep('INIT')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}

                    <div className="flex flex-col gap-1.5 min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Report Violation
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Submit a new incident report for campus vehicle violations.
                        </p>
                    </div>
                </div>

                {/* Native Landing (INIT Step) - Vertical Action Tiles */}
                {step === 'INIT' && (
                    <div className="flex flex-col bg-card rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 shadow-sm">
                        <div
                            className="group flex items-center gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 active:bg-zinc-100 dark:active:bg-zinc-900 transition-all cursor-pointer"
                            onClick={() => setStep('SCAN')}
                        >
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <Scan className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold tracking-tight text-foreground">Scan QR Sticker</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Use device camera for instant ID</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-primary transition-colors" />
                        </div>

                        <div
                            className="group flex items-center gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 active:bg-zinc-100 dark:active:bg-zinc-900 transition-all cursor-pointer"
                            onClick={() => setStep('MANUAL')}
                        >
                            <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <Keyboard className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold tracking-tight text-foreground">Manual Identification</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Search via license plate or ID</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                )}

                {step === 'SCAN' && (
                    <div className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden animate-in fade-in duration-300">
                        {/* minimalist Biometric Header - 100% Pixel Parity with Face Scan */}
                        <div className="flex items-center justify-between px-4 py-3 bg-black/80 shrink-0 z-[110]">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                onClick={() => setStep('INIT')}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <span className="text-base font-semibold text-white">Identity Scanner</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                onClick={startScanner}
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Immersive Viewport */}
                        <div className="relative flex-1 bg-black">
                            {isScanning ? (
                                <div className="absolute inset-0 w-full h-full overflow-hidden">
                                    <Scanner
                                        onScan={handleScan}
                                        onError={(err) => console.error(err)}
                                        paused={cameraPaused}
                                        allowMultiple={false}
                                        sound={false}
                                        styles={{
                                            container: { width: '100%', height: '100%' },
                                            video: { width: '100%', height: '100%', objectFit: 'cover' }
                                        }}
                                        components={{
                                            torch: false,
                                            zoom: false,
                                            finder: false // We use our own custom centered finder
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black">
                                    <Camera className="h-16 w-16 text-zinc-800 mb-6" />
                                    <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">Camera Access Required</h3>
                                    <p className="text-sm text-zinc-400 mb-8 max-w-xs leading-relaxed text-center">
                                        Please enable camera permissions in your browser to scan identifying decals.
                                    </p>
                                    <Button
                                        onClick={startScanner}
                                        className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full"
                                    >
                                        Retry Camera
                                    </Button>
                                </div>
                            )}

                            {/* Minimalist Viewfinder Overlay */}
                            <div className="absolute inset-0 z-[105] flex flex-col items-center justify-center pointer-events-none">
                                <div className="relative flex flex-col items-center justify-center">
                                    {/* Scanning Effects */}
                                    <div className="relative flex flex-col items-center justify-center">
                                        {/* Precision Laser Line */}
                                        {isScanning && (
                                            <div className="absolute left-1/2 -translate-x-1/2 w-[80vmin] h-1 bg-white/20 blur-[1px] shadow-[0_0_10px_rgba(255,255,255,0.3)] animate-scanner-line z-20" />
                                        )}

                                        <div className="flex flex-col items-center">
                                            {/* Minimalist Frameless Viewport with Outside Overlay */}
                                            <div className={cn(
                                                "w-[80vmin] aspect-square rounded-[2rem] transition-all duration-500 shrink-0",
                                                "shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]", // The Overlay
                                                isScanning ? "bg-transparent" : "bg-black/40"
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Standardized Manual Identification (MANUAL Step) */}
                {step === 'MANUAL' && (
                    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b">
                                <CardTitle className="text-lg font-bold">Search Vehicle Identity</CardTitle>
                                <CardDescription>Provide license plate or sticker details to lookup dossier</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                {/* Option 1: Plate Number */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search by Plate Number</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                placeholder="ABC-1234"
                                                className="pl-10 h-10"
                                                value={manualPlate}
                                                onChange={(e) => {
                                                    setManualPlate(e.target.value.toUpperCase());
                                                    setManualSticker('');
                                                    setManualStickerColorId('');
                                                }}
                                            />
                                        </div>
                                        <Button
                                            onClick={() => handleIdentify({ plate_number: manualPlate })}
                                            disabled={!manualPlate || isIdentifying}
                                        >
                                            {isIdentifying && manualPlate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Identify"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t" />
                                    <span className="flex-shrink mx-4 text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">Administrative Sync</span>
                                    <div className="flex-grow border-t" />
                                </div>

                                {/* Option 2: Sticker Details */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search by Sticker Identity</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Select
                                                value={manualStickerColorId}
                                                onValueChange={(v) => {
                                                    setManualStickerColorId(v === "none" ? "" : v);
                                                    setManualPlate('');
                                                }}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Choose Color" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Clear Selection</SelectItem>
                                                    {stickerColors.map((color) => (
                                                        <SelectItem key={color.id} value={color.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: color.hex_code }} />
                                                                {color.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Input
                                            placeholder="Sticker Number"
                                            className="h-10"
                                            value={manualSticker}
                                            onChange={(e) => {
                                                setManualSticker(e.target.value);
                                                setManualPlate('');
                                            }}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleIdentify({ sticker_number: manualSticker, sticker_color_id: manualStickerColorId })}
                                        disabled={!manualSticker || !manualStickerColorId || isIdentifying}
                                    >
                                        {isIdentifying && manualSticker ? <Loader2 className="h-4 w-4 animate-spin" /> : "Identify"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}


                {step === 'VERIFY' && (
                    <div className="flex flex-col items-center justify-center p-24 text-center gap-6">
                        <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold tracking-tight">Synchronizing Identity...</h3>
                            <p className="text-xs font-medium text-muted-foreground">Consulting the secure registration database</p>
                        </div>
                    </div>
                )}


                {step === 'FORM' && (
                    <div className={cn(
                        "w-full transition-all duration-500",
                        !isMobile && "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 rounded-lg shadow-sm overflow-hidden"
                    )}>
                        {!isMobile && (
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-900/10">
                                <h2 className="text-lg font-semibold tracking-tight">Violation Report Details</h2>
                                <p className="text-sm text-zinc-500 mt-0.5">
                                    Document the incident with target dossier: <span className="font-bold text-foreground">{identifiedVehicle?.vehicle.plate_number}</span>
                                    {identifiedVehicle?.owner?.name && (
                                        <> • <span className="font-bold text-foreground">{identifiedVehicle.owner.name}</span></>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className={cn("space-y-6", isMobile ? "px-0 py-2" : "p-8")}>
                            {isMobile && identifiedVehicle && (
                                <div className="flex flex-col gap-1 mb-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                        Active Reporting Dossier
                                    </div>
                                    <div className="text-xl font-bold tracking-tight">
                                        {identifiedVehicle.vehicle.plate_number}
                                    </div>
                                    {identifiedVehicle.owner?.name && (
                                        <div className="text-sm text-muted-foreground">
                                            {identifiedVehicle.owner.name}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        Identity Synchronized
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                {/* Violation Category */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="violation_type_id">Violation Category</Label>
                                    <Select onValueChange={(v) => setData('violation_type_id', v)}>
                                        <SelectTrigger id="violation_type_id" className="h-10 bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800/50 rounded-md shadow-none text-sm font-medium">
                                            <SelectValue placeholder="Select violation type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-md border-zinc-200 dark:border-zinc-800 shadow-xl">
                                            {violationTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()} className="text-sm">
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.violation_type_id && <p className="text-xs text-red-500 mt-1">{errors.violation_type_id}</p>}
                                </div>

                                {/* Incident Location - Interactive Map with Pin */}
                                <div className="space-y-1.5">
                                    <Label>Incident Location</Label>
                                    <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
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
                                            onTransform={(_r, state) => setZoom(state.scale)}
                                        >
                                            {({ zoomIn, zoomOut, resetTransform }) => (
                                                <div
                                                    ref={containerRef}
                                                    className={cn(
                                                        'relative overflow-hidden touch-none cursor-crosshair w-full aspect-[5.5/4]',
                                                        isMobile ? 'min-h-0' : 'lg:flex-1'
                                                    )}
                                                    onPointerDown={handlePointerDown}
                                                    onPointerMove={handlePointerMove}
                                                    onPointerUp={handlePointerUp}
                                                    onPointerCancel={() => { isDraggingRef.current = false; dragStartRef.current = null; }}
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
                                                            {/* Base map image */}
                                                            <img
                                                                src="/storage/images/map/campus-map.svg"
                                                                alt="Campus Map"
                                                                className="block h-full w-full select-none pointer-events-none"
                                                                style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
                                                                draggable={false}
                                                            />

                                                            {/* SVG overlay with zones */}
                                                            <svg
                                                                className="absolute inset-0 w-full h-full"
                                                                viewBox="0 0 100 100"
                                                                preserveAspectRatio="none"
                                                            >
                                                                {/* Zone polygons */}
                                                                {mapLocationsMemo.map((loc) => {
                                                                    if (!loc.vertices || loc.vertices.length === 0) return null;
                                                                    const color = loc.color || loc.type?.default_color || '#3b82f6';
                                                                    const isSelected = data.location === loc.name;
                                                                    return (
                                                                        <g key={loc.id}>
                                                                            <polygon
                                                                                points={loc.vertices.map((v) => `${v.x},${v.y}`).join(' ')}
                                                                                fill={color}
                                                                                fillOpacity={isSelected ? 0.35 : 0}
                                                                                className="transition-all duration-200 hover:fill-opacity-20 cursor-pointer"
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

                                                                {/* Pin marker - scales inversely with zoom to stay consistent */}
                                                                {pinPosition && (
                                                                    <g transform={`translate(${pinPosition.x}, ${pinPosition.y}) scale(${0.6 / Math.pow(zoom, 0.6)})`}>
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
                                                                )}
                                                            </svg>
                                                        </div>
                                                    </TransformComponent>

                                                    {/* Zoom controls */}
                                                    <div
                                                        className="map-pan-exclude absolute bottom-4 left-4 flex flex-col gap-1.5 z-20"
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                    >
                                                        <Button
                                                            size="icon"
                                                            type="button"
                                                            className="bg-zinc-800 hover:bg-zinc-900 text-white border-0 h-8 w-8 rounded-lg shadow-lg"
                                                            onClick={(e) => { e.stopPropagation(); zoomIn(0.5); }}
                                                        >
                                                            <ZoomIn className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            type="button"
                                                            className="bg-zinc-800 hover:bg-zinc-900 text-white border-0 h-8 w-8 rounded-lg shadow-lg"
                                                            onClick={(e) => { e.stopPropagation(); zoomOut(0.5); }}
                                                        >
                                                            <ZoomOut className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            type="button"
                                                            className="bg-zinc-800 hover:bg-zinc-900 text-white border-0 h-8 w-8 rounded-lg shadow-lg"
                                                            onClick={(e) => { e.stopPropagation(); resetTransform(); }}
                                                        >
                                                            <LocateFixed className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </TransformWrapper>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-muted-foreground">Tap on the map to pin the incident location</p>
                                        {data.location && (
                                            <Badge variant="secondary" className="text-xs w-fit">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {data.location}
                                            </Badge>
                                        )}
                                    </div>
                                    {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                                </div>

                                {/* Evidence Documentation */}
                                <div className="space-y-1.5">
                                    <Label>Evidence Documentation</Label>
                                    {!previewUrl ? (
                                        <div className="flex w-full border border-input bg-background rounded-lg overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                            <button
                                                type="button"
                                                className="flex-1 flex items-center gap-2.5 px-3 h-10 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors"
                                                onClick={() => setCameraOpen(true)}
                                            >
                                                <Camera className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span>Take Photo</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-1 flex items-center gap-2.5 px-3 h-10 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors border-l border-input/50"
                                                onClick={() => document.getElementById('upload-input')?.click()}
                                            >
                                                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span>Upload</span>
                                            </button>
                                            <input
                                                id="upload-input"
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                            <img src={previewUrl} className="w-full max-h-80 object-contain bg-zinc-100 dark:bg-zinc-900" alt="Evidence" />
                                            <div className="absolute bottom-2 left-2 right-2 flex gap-2 justify-end">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-white/90 hover:bg-white text-zinc-900 border border-zinc-200"
                                                    onClick={() => setViewOpen(true)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" /> View
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-white/90 hover:bg-white text-zinc-900 border border-zinc-200"
                                                    onClick={() => { setPreviewUrl(null); setData('evidence_image', null); }}
                                                >
                                                    <RefreshCw className="h-4 w-4 mr-1" /> Replace
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {errors.evidence_image && <p className="text-xs text-red-500 mt-1">{errors.evidence_image}</p>}
                                </div>

                                {/* Narrative Details */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="description">Narrative Details</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="min-h-[120px] bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800/50 rounded-md p-4 text-sm font-medium resize-none shadow-none focus:ring-primary/10 transition-all leading-relaxed"
                                        placeholder="Provide detailed observations of the violation..."
                                    />
                                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                                </div>

                                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-11 font-semibold rounded-md bg-primary hover:bg-primary/90 text-white transition-all transform active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 dark:bg-primary dark:text-primary-foreground"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Transmitting Incident Report...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-3.5 w-3.5" />
                                                Submit Incident Report
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <CameraCaptureDialog
                isOpen={cameraOpen}
                onClose={() => setCameraOpen(false)}
                onCapture={handleCameraCapture}
                title="Capture Evidence Photo"
                facingMode="environment"
            />

            {/* Image view lightbox */}
            {viewOpen && previewUrl && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)' }}
                    className="flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setViewOpen(false)}
                >
                    <div className="relative group max-w-full max-h-[90vh]">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full h-8 w-8 transition-all flex items-center justify-center shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewOpen(false);
                            }}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <img
                            src={previewUrl}
                            alt="Evidence preview"
                            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
