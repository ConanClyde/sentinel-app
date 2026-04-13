import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { QrCode, Scan, ShieldCheck, MapPin, Camera, Radio, Wifi, Zap, RefreshCw, X, MessageSquareText } from 'lucide-react';
import { cn, parsePatrolQR } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Scan Patrol Point', href: route('security.scan') },
];

interface MapLocation {
    id: number;
    name: string;
    short_code: string;
    color: string | null;
    type?: {
        name: string;
        default_color: string;
    };
}

export default function SecurityScan({ preselectedLocation }: { preselectedLocation?: MapLocation }) {
    const [isScanning, setIsScanning] = useState(true);
    const [cameraPaused, setCameraPaused] = useState(false);
    const [notes, setNotes] = useState('');
    const [activeLocation, setActiveLocation] = useState<MapLocation | null>(preselectedLocation || null);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    const startScanner = () => {
        setIsScanning(true);
        setCameraPaused(false);
        setScanError(null);
    };

    const stopScanner = () => {
        setIsScanning(false);
    };

    const executeCheckIn = async (locationId: number, locationName: string) => {
        setIsCheckingIn(true);
        try {
            const response = await axios.post(route('api.patrol.check-in'), {
                map_location_id: locationId,
                notes: notes || undefined,
            });
            
            toast.success(`Check-in recorded at ${locationName}`);
            setNotes('');
            setActiveLocation(null); // Clear active location after success
            setIsScanning(true); // Restart scanner protocol
            
            // If we came from a URL param, clear it
            if (window.location.search.includes('location=')) {
                window.history.replaceState({}, '', route('security.scan'));
            }
            
        } catch (error: any) {
            if (error.response?.status === 422) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred while recording your check-in. Please try again.');
            }
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleScan = async (result: any) => {
        if (!result || !result[0]?.rawValue) return;
        
        const rawValue = result[0].rawValue;
        const identifier = parsePatrolQR(rawValue);
        
        if (!identifier) {
            toast.error('Invalid QR code format. Please scan a patrol point QR code.');
            return;
        }
        
        try {
            // Fetch all locations to find the one scanned
            const response = await axios.get(route('shared.api.map.locations'));
            const locations: MapLocation[] = response.data;
            
            // Search by both ID (stringified for safety) and Short Code
            const location = locations.find(l => 
                l.id.toString() === identifier || 
                l.short_code.toUpperCase() === identifier.toUpperCase()
            );
            
            if (location) {
                setActiveLocation(location);
                stopScanner();
            } else {
                toast.error('This patrol point is not registered or is currently inactive.');
            }
        } catch (error) {
            toast.error('Network error while verifying patrol point.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} fullWidth={isScanning}>
            <Head title="Patrol Scanner" />

            <div className={cn(
                "mx-auto flex flex-col pb-20 transition-all duration-500",
                isScanning ? "max-w-full lg:px-0 gap-0" : "max-w-4xl gap-6"
            )}>


                {/* SCAN State: Full-screen Immersive Overlay (Matches Report.tsx SCAN) */}
                {isScanning && (
                    <div className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden animate-in fade-in duration-300">
                        {/* minimalist Biometric Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-black/80 shrink-0 z-[110]">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all" 
                                onClick={() => router.visit(route('dashboard'))}
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
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                                <Scanner 
                                    onScan={handleScan}
                                    onError={(err: any) => {
                                        console.error(err);
                                        setScanError(err?.toString() || 'Unknown imaging error');
                                    }}
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
                                        finder: false
                                    }}
                                />
                            </div>
                            
                            {/* Viewfinder Overlay - Absolute Parity with Report UI */}
                            <div className="absolute inset-0 z-[105] flex flex-col items-center justify-center pointer-events-none">
                                <div className="relative flex flex-col items-center justify-center">
                                    <div className="relative flex flex-col items-center justify-center">
                                        {/* Precision Laser Line */}
                                        {isScanning && !scanError && (
                                            <div className="absolute left-1/2 -translate-x-1/2 w-[80vmin] h-1 bg-white/20 blur-[1px] shadow-[0_0_10px_rgba(255,255,255,0.3)] animate-scanner-line z-20" />
                                        )}

                                        <div className="flex flex-col items-center">
                                            {/* Minimalist Frameless Viewport with Outside Overlay */}
                                            <div className={cn(
                                                "w-[80vmin] aspect-square rounded-[2rem] transition-all duration-500 shrink-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]",
                                                scanError ? "border-2 border-primary/20 bg-primary/5" : "bg-transparent"
                                            )} />
                                        </div>

                                        {/* Error Alert Overlay */}
                                        {scanError && (
                                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center pointer-events-auto animate-in zoom-in-95 duration-300">
                                                <div className="p-6 rounded-3xl bg-black/80 border border-primary/20 backdrop-blur-xl flex flex-col items-center gap-4 max-w-[70vmin]">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                        <Camera className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Hardware Conflict</h4>
                                                        <p className="text-[10px] text-white/40 uppercase tracking-tighter leading-tight">
                                                            {scanError.includes('NotReadableError') || scanError.includes('use') 
                                                                ? "Camera resource is currently locked by another application." 
                                                                : "Permission denied or imaging hardware unavailable."}
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        onClick={startScanner}
                                                        size="sm"
                                                        className="mt-2 h-9 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest px-6"
                                                    >
                                                        Retry Protocol
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FORM State (Matches Report.tsx Form/Active State) */}
                {activeLocation && (
                    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 rounded-xl overflow-hidden shadow-xl border-t-4" style={{ borderTopColor: activeLocation.color || activeLocation.type?.default_color || '#ef4444' }}>
                            <div className="p-8 flex flex-col items-center text-center gap-6">
                                <div 
                                    className="w-20 h-20 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3"
                                    style={{ background: activeLocation.color || activeLocation.type?.default_color || '#ef4444' }}
                                >
                                    <MapPin className="h-10 w-10 text-white" />
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tight">{activeLocation.name}</h3>
                                    <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800 text-muted-foreground font-mono text-xs px-3">
                                        SECTOR ID: {activeLocation.short_code}
                                    </Badge>
                                </div>

                                <div className="w-full space-y-3 text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquareText className="h-3 w-3 text-muted-foreground" />
                                        <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Patrol Log / Findings</Label>
                                    </div>
                                    <Textarea 
                                        id="notes"
                                        placeholder="Add any observations or notes for this patrol point..." 
                                        className="min-h-[100px] bg-muted/30 border-zinc-200 dark:border-zinc-800 rounded-xl resize-none focus:ring-primary/20"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="w-full space-y-4 pt-4">
                                    <Button 
                                        onClick={() => executeCheckIn(activeLocation.id, activeLocation.name)}
                                        disabled={isCheckingIn}
                                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 gap-3 group transition-all transform active:scale-95 text-xl"
                                    >
                                        {isCheckingIn ? <RefreshCw className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                                        {isCheckingIn ? 'Processing...' : 'Confirm Presence'}
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        onClick={() => {
                                            setActiveLocation(null);
                                            setIsScanning(true);
                                        }}
                                        className="w-full text-muted-foreground hover:text-foreground uppercase font-black text-[10px] tracking-widest"
                                    >
                                        Cancel Protocol
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}

