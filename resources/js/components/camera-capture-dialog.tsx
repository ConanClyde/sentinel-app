import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Check, X, AlertTriangle, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CameraCaptureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
    title?: string;
    facingMode?: 'user' | 'environment';
    showFaceOverlay?: boolean;
}

export function CameraCaptureDialog({
    isOpen,
    onClose,
    onCapture,
    title = 'Take Photo',
    facingMode = 'environment',
    showFaceOverlay = false,
}: CameraCaptureDialogProps) {
    const videoRef  = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nativeInputRef = useRef<HTMLInputElement>(null);

    // getUserMedia is only available in secure contexts (HTTPS / localhost).
    // Over plain HTTP (e.g., LAN dev testing), we fall back to native <input capture>.
    const isSecureContext = typeof window !== 'undefined' &&
        (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1');

    const [stream, setStream]               = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError]                 = useState<string | null>(null);
    const [loading, setLoading]             = useState(false);
    const [visible, setVisible]             = useState(false);
    const [devices, setDevices]             = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);


    const startCamera = async (deviceId?: string) => {
        setError(null);
        setCapturedImage(null);
        setLoading(true);
        
        try {
            // Priority: High quality (1280x720) with specific device if requested
            const baseVideoSettings = {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            };

            const constraints: MediaStreamConstraints = {
                video: deviceId 
                    ? { deviceId: { exact: deviceId }, ...baseVideoSettings } 
                    : { facingMode, ...baseVideoSettings }
            };

            let mediaStream: MediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (firstErr: any) {
                // If high-quality fails (Overconstrained), try fallback with just basic video
                if (firstErr.name === 'OverconstrainedError' || firstErr.name === 'ConstraintNotSatisfiedError') {
                    console.warn('Overconstrained, falling back to basic resolution');
                    mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode }
                    });
                } else {
                    throw firstErr;
                }
            }
            
            setStream(mediaStream);

            const videoTrack = mediaStream.getVideoTracks()[0];
            if (videoTrack) {
                const settings = videoTrack.getSettings();
                if (settings.deviceId) setActiveDeviceId(settings.deviceId);
            }

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }
        } catch (err: any) {
            console.error('Camera error:', err);
            
            let userMessage = 'Camera access denied or unavailable.';
            if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                userMessage = 'Camera is already in use by another application (Zoom, Teams, etc.). Please close other apps and try again.';
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                userMessage = 'Camera permission was denied. Please allow camera access in your browser settings.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                userMessage = 'No camera hardware detected on this device.';
            }

            setError(userMessage);
            toast.error(userMessage);
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = () => {
        // Stop the stream tracks recorded in state
        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
                console.log('Stopped track from state:', track.label);
            });
            setStream(null);
        }

        // Also stop tracks from the video element directly to be absolute
        if (videoRef.current && videoRef.current.srcObject) {
            const activeStream = videoRef.current.srcObject as MediaStream;
            activeStream.getTracks().forEach((track) => {
                track.stop();
                console.log('Stopped track from video element:', track.label);
            });
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        const loadDevices = async () => {
            try {
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
                setDevices(videoDevices);
            } catch (e) {
                console.error('Failed to list devices', e);
            }
        };

        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
            loadDevices();
            startCamera();
            document.body.style.overflow = 'hidden';
        } else {
            setVisible(false);
            stopCamera();
            setCapturedImage(null);
            setError(null);
            setActiveDeviceId(null);
            document.body.style.overflow = '';
        }
        return () => {
            stopCamera();
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.92));
        stopCamera();
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleConfirm = () => {
        canvasRef.current?.toBlob(
            (blob) => {
                if (!blob) { toast.error('Failed to process image.'); return; }
                const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
                onClose();
            },
            'image/jpeg',
            0.92,
        );
    };

    if (!isOpen) return null;

    // ── Insecure context fallback (HTTP LAN dev) ────────────────────────
    if (!isSecureContext) {
        const fallback = (
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.96)',
                    transformOrigin: 'center center',
                    transition: 'opacity 200ms ease, transform 200ms ease',
                }}
                className="flex flex-col bg-black text-white"
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className="flex items-center justify-between px-4 py-3 bg-black/80 shrink-0">
                    <button type="button" onClick={onClose}
                        className="h-9 w-9 rounded-full flex items-center justify-center text-white hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </button>
                    <span className="text-base font-semibold">{title}</span>
                    <div className="h-9 w-9" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-base mb-1">Camera requires HTTPS</p>
                        <p className="text-white/60 text-sm leading-relaxed">
                            You're on HTTP (dev mode). Tap below to use your device's native camera instead.
                        </p>
                    </div>

                    <input
                        ref={nativeInputRef}
                        type="file"
                        accept="image/*"
                        capture={facingMode === 'user' ? 'user' : 'environment'}
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { onCapture(file); onClose(); }
                        }}
                    />
                    <Button
                        type="button"
                        className="h-12 px-8 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                        onClick={() => nativeInputRef.current?.click()}
                    >
                        <Camera className="mr-2 h-4 w-4" /> Open Camera
                    </Button>
                </div>

                <div className="px-6 py-6 bg-black/80 shrink-0" />
            </div>
        );
        return createPortal(fallback, document.body);
    }

    const modal = (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                // Animate opacity + scale from center
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(0.96)',
                transformOrigin: 'center center',
                transition: 'opacity 200ms ease, transform 200ms ease',
            }}
            className="flex flex-col bg-black text-white"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            {/* ── Header ───────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close camera"
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
                <span className="text-base font-semibold">{title}</span>
                {devices.length > 1 ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="h-9 w-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                aria-label="Switch Camera"
                            >
                                <RefreshCcw className="h-5 w-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-800 text-white">
                            {devices.map((device, idx) => (
                                <DropdownMenuItem
                                    key={device.deviceId}
                                    onClick={() => {
                                        stopCamera();
                                        startCamera(device.deviceId);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer focus:bg-white/10 focus:text-white"
                                >
                                    <div className={`h-2 w-2 rounded-full ${activeDeviceId === device.deviceId ? 'bg-green-500' : 'bg-transparent'}`} />
                                    <span className="truncate">
                                        {device.label || `Camera ${idx + 1}`}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="h-9 w-9" aria-hidden="true" />
                )}
            </div>

            {/* ── Viewfinder ───────────────────────────────────── */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-0">
                {loading && !error && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black text-center px-6">
                        <Loader2 className="h-10 w-10 animate-spin text-white/50" />
                        <p className="text-sm text-white/70 font-medium">Starting camera...</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center text-center gap-3 px-8">
                        <div className="h-14 w-14 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="h-7 w-7 text-red-400" />
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
                            onClick={() => startCamera()}
                            type="button"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {!error && !capturedImage && (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                            autoPlay
                            playsInline
                            muted
                        />
                        {showFaceOverlay && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <svg
                                    viewBox="0 0 220 280"
                                    className="w-48 h-60 sm:w-52 sm:h-64"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <defs>
                                        <mask id="oval-mask">
                                            <rect width="220" height="280" fill="white" />
                                            <ellipse cx="110" cy="140" rx="88" ry="112" fill="black" />
                                        </mask>
                                    </defs>
                                    <rect width="220" height="280" fill="rgba(0,0,0,0.5)" mask="url(#oval-mask)" />
                                    <ellipse
                                        cx="110" cy="140" rx="88" ry="112"
                                        fill="none" stroke="white"
                                        strokeWidth="2.5" strokeDasharray="10 5"
                                    />
                                </svg>
                                <p className="text-white text-xs font-medium mt-3 tracking-widest drop-shadow-lg uppercase">
                                    Align face inside oval
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {capturedImage && (
                    <img
                        src={capturedImage}
                        alt="Captured photo preview"
                        className="w-full h-full object-contain"
                    />
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* ── Action Bar ───────────────────────────────────── */}
            <div className="flex items-center justify-center gap-4 px-6 py-6 bg-black/80 shrink-0">
                {!capturedImage && !error && !loading && (
                    <>
                        <div className="w-14" aria-hidden="true" />
                        <button
                            type="button"
                            onClick={handleCapture}
                            aria-label="Capture photo"
                            className="h-16 w-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 active:scale-95 transition-transform flex items-center justify-center focus:outline-none"
                        >
                            <Camera className="h-7 w-7 text-white" />
                        </button>
                        <div className="w-14" aria-hidden="true" />
                    </>
                )}

                {capturedImage && (
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleRetake}
                            className="flex-1 h-12 border-white/30 text-white hover:bg-white/10 bg-transparent"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Retake
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white border-0"
                        >
                            <Check className="mr-2 h-4 w-4" /> Use Photo
                        </Button>
                    </>
                )}

                {error && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-12 px-8 border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                        Close
                    </Button>
                )}
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
