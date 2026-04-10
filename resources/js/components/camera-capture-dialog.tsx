import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, Check, X, AlertTriangle, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

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
    const detectorRef = useRef<FaceLandmarker | null>(null);
    const requestRef = useRef<number | null>(null);
    const startingRef = useRef<boolean>(false);
    const capturingRef = useRef<boolean>(false);
    const isMountedRef = useRef<boolean>(true);

    // getUserMedia is only available in secure contexts (HTTPS / localhost).
    // Over plain HTTP (e.g., LAN dev testing), we fall back to native <input capture>.
    const isSecureContext = typeof window !== 'undefined' &&
        (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1');

    const [stream, setStream]               = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [error, setError]                 = useState<string | null>(null);
    const [loading, setLoading]             = useState(false);
    const [visible, setVisible]             = useState(false);
    const [devices, setDevices]             = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

    // AI & Animation State
    const [faceDetected, setFaceDetected] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [detectorLoaded, setDetectorLoaded] = useState(false);

    // Initialize MediaPipe Detector
    const initDetector = useCallback(async () => {
        if (detectorRef.current) return;

        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            const landmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "GPU"
              },
              outputFaceBlendshapes: true,
              runningMode: "VIDEO",
              numFaces: 1
            });
            detectorRef.current = landmarker;
            setDetectorLoaded(true);
        } catch (err) {
            console.error("Failed to initialize Face Landmarker:", err);
        }
    }, []);

    const startDetection = useCallback(() => {
        if (!detectorRef.current || !videoRef.current || !showFaceOverlay) return;

        const detect = async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                const results = detectorRef.current?.detectForVideo(videoRef.current, performance.now());

                if (results && results.faceLandmarks.length > 0) {
                    setFaceDetected(true);

                    // Check for blinks in blendshapes
                    if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                        const shapes = results.faceBlendshapes[0].categories;
                        const eyeBlinkLeft = shapes.find(s => s.categoryName === "eyeBlinkLeft")?.score || 0;
                        const eyeBlinkRight = shapes.find(s => s.categoryName === "eyeBlinkRight")?.score || 0;

                        // Detection: High score means eyes are closed (a blink)
                        if (eyeBlinkLeft > 0.4 && eyeBlinkRight > 0.4) {
                            if (!isBlinking && !capturingRef.current) {
                                setIsBlinking(true);
                                capturingRef.current = true;

                                // Wait 500ms to allow eyes to open back up
                                setTimeout(() => {
                                    // Only capture if still in face scan mode
                                    if (isMountedRef.current && showFaceOverlay) {
                                        handleCapture();
                                    }
                                    capturingRef.current = false;
                                    setIsBlinking(false);
                                }, 500);
                            }
                        }
                    }
                } else {
                    setFaceDetected(false);
                }
            }
            requestRef.current = requestAnimationFrame(detect);
        };

        requestRef.current = requestAnimationFrame(detect);
    }, [showFaceOverlay, isBlinking]);

    const startCamera = async (deviceId?: string) => {
        if (startingRef.current) return;
        startingRef.current = true;

        setError(null);
        setCapturedImage(null);
        setLoading(true);
        setFaceDetected(false);
        setIsBlinking(false);

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

            if (videoRef.current && isMountedRef.current) {
                videoRef.current.srcObject = mediaStream;
                try {
                    await videoRef.current.play();
                } catch (playErr: any) {
                    // Ignore AbortError: play() was interrupted (usually by unmount or new load)
                    if (playErr.name !== 'AbortError') throw playErr;
                }
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
            startingRef.current = false;
            setLoading(false);
        }
    };

    const stopCamera = () => {
        // Stop current animation loop
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        // Stop the stream tracks recorded in state
        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            setStream(null);
        }

        // Also stop tracks from the video element directly to be absolute
        if (videoRef.current && videoRef.current.srcObject) {
            const activeStream = videoRef.current.srcObject as MediaStream;
            activeStream.getTracks().forEach((track) => {
                track.stop();
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
            isMountedRef.current = true;
            requestAnimationFrame(() => setVisible(true));
            loadDevices();

            const prepare = async () => {
                if (showFaceOverlay && !detectorLoaded) {
                    await initDetector();
                }
                if (isMountedRef.current) {
                   await startCamera();
                }
            };

            prepare();
            document.body.style.overflow = 'hidden';
        } else {
            isMountedRef.current = false;
            setVisible(false);
            stopCamera();
            if (capturedImage && capturedImage.startsWith('blob:')) {
                URL.revokeObjectURL(capturedImage);
            }
            setCapturedImage(null);
            setCapturedBlob(null);
            setError(null);
            setActiveDeviceId(null);
            setFaceDetected(false);
            setIsBlinking(false);
            document.body.style.overflow = '';
        }
        return () => {
            isMountedRef.current = false;
            stopCamera();
            document.body.style.overflow = '';
        };
    }, [isOpen, showFaceOverlay, detectorLoaded]);

    // Start detection loop when stream is ready
    useEffect(() => {
        if (stream && showFaceOverlay && detectorLoaded) {
            startDetection();
        }
    }, [stream, showFaceOverlay, detectorLoaded, startDetection]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video  = videoRef.current;
        const canvas = canvasRef.current;

        // Ensure the video has valid dimensions before capturing
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            return;
        }

        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Try to get direct stream settings for accurate mirroring
        const activeStream = video.srcObject as MediaStream;
        const activeTrack = activeStream?.getVideoTracks()[0];

        let shouldMirror = facingMode === 'user';
        if (activeTrack) {
            const settings = activeTrack.getSettings();
            if (settings.facingMode) {
                shouldMirror = settings.facingMode === 'user';
            } else if (activeTrack.label.toLowerCase().includes('front') || activeTrack.label.toLowerCase().includes('user')) {
                shouldMirror = true;
            }
        }

        if (shouldMirror) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                setCapturedBlob(blob);
                const url = URL.createObjectURL(blob);
                setCapturedImage(url);
            }
        }, 'image/jpeg', 0.95);

        stopCamera();
    };

    const handleRetake = () => {
        if (capturedImage && capturedImage.startsWith('blob:')) {
            URL.revokeObjectURL(capturedImage);
        }
        setCapturedImage(null);
        setCapturedBlob(null);
        startCamera();
    };

    const handleConfirm = async () => {
        if (capturedBlob) {
            const file = new File([capturedBlob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
            onClose();
            return;
        }

        // Fallback: If blob is missing for some reason, try to convert the base64 dataURL
        if (capturedImage) {
            try {
                const res = await fetch(capturedImage);
                const blob = await res.blob();
                const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
                onClose();
            } catch (err) {
                console.error('Final fallback failed:', err);
                toast.error('Failed to process image. Please try again.');
            }
        }
    };

    if (!isOpen) return null;

    // Unsupported/Insecure Context State
    if (!isSecureContext || (typeof navigator !== 'undefined' && (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia))) {
        const unsupported = (
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.96)',
                    transformOrigin: 'center center',
                    transition: 'opacity 200ms ease, transform 200ms ease',
                }}
                className="flex flex-col bg-black text-white items-center justify-center p-8 text-center"
                role="dialog"
                aria-modal="true"
            >
                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Secure Scanner Required</h2>
                <p className="text-white/60 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                    Sentinel biometric scanning requires a secure connection (HTTPS) and a modern browser
                    to perform live liveness detection.
                </p>
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-12 px-8 border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                    Close
                </Button>
            </div>
        );
        return createPortal(unsupported, document.body);
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
            {/* Header */}
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

            {/* Viewfinder - Full screen in face scan mode */}
            <div className="relative flex-1 overflow-hidden min-h-0">
                {loading && !error && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black text-center px-6">
                        <Loader2 className="h-10 w-10 animate-spin text-white/50" />
                        <p className="text-sm text-white/70 font-medium">Starting camera...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 px-8">
                        <div className="h-14 w-14 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="h-7 w-7 text-red-400" />
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{error}</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-12 px-8 border-white/30 text-white hover:bg-white/10 bg-transparent"
                        >
                            Close
                        </Button>
                    </div>
                )}

                {!error && !capturedImage && (
                    <div className="absolute inset-0">
                        <video
                            ref={videoRef}
                            className={cn(
                                "w-full h-full object-cover",
                                (stream?.getVideoTracks()[0]?.label.toLowerCase().includes('user') ||
                                 stream?.getVideoTracks()[0]?.label.toLowerCase().includes('front') ||
                                 facingMode === 'user') ? 'scale-x-[-1]' : ''
                            )}
                            autoPlay
                            playsInline
                            muted
                        />
                        {showFaceOverlay && (
                            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
                                {/* Full-screen Dimming with Oval Cutout */}
                                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <mask id="full-viewfinder-mask">
                                            <rect width="100%" height="100%" fill="white" />
                                            {/* Scalable cutout ellipse */}
                                            <ellipse
                                                cx="50%" cy="50%"
                                                rx="min(45vmin, 220px)"
                                                ry="min(70vmin, 320px)"
                                                fill="black"
                                            />
                                        </mask>
                                    </defs>
                                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#full-viewfinder-mask)" />
                                </svg>

                                {/* Scanning Effects & Indicators */}
                                <div className="relative flex flex-col items-center justify-center">
                                    {/* Scanning Laser Line */}
                                    {!loading && (
                                        <div className="absolute left-1/2 -translate-x-1/2 w-64 h-1 bg-green-500/60 blur-[1px] shadow-[0_0_15px_rgba(34,197,94,1)] animate-scanner-line z-20" />
                                    )}

                                    <div className="flex flex-col items-center gap-6">
                                        <div className={cn(
                                            "transition-all duration-700 p-1 rounded-[40%] border-2 border-dashed",
                                            faceDetected ? "border-green-400 bg-green-500/5" : "border-white/30 bg-black/5"
                                        )}>
                                            <svg
                                                viewBox="0 0 260 420"
                                                className={cn(
                                                    "w-[min(85vmin,420px)] h-auto transition-transform duration-500 z-10",
                                                    faceDetected ? "scale-105" : "scale-100"
                                                )}
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M130,10 C60,10 10,95 10,215 C10,335 60,410 130,410 C200,410 250,335 250,215 C250,95 200,10 130,10 Z"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    className={cn(
                                                        "transition-colors duration-500",
                                                        faceDetected ? "text-green-400 animate-scanner-pulse" : "text-white/40"
                                                    )}
                                                />
                                            </svg>
                                        </div>

                                        <div className="flex flex-col items-center gap-1.5 drop-shadow-md z-10">
                                            <span className={cn(
                                                "text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-300",
                                                faceDetected ? "text-green-400" : "text-white/60"
                                            )}>
                                                {faceDetected ? "Ready to Scan" : "Position Face"}
                                            </span>
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight px-5 py-2 rounded-full backdrop-blur-md transition-all duration-300",
                                                faceDetected
                                                    ? "bg-green-500/20 text-green-100 animate-text-ready"
                                                    : "bg-black/40 text-white/90"
                                            )}>
                                                {faceDetected ? "Blink to capture" : "Align face inside oval"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {capturedImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <img
                            src={capturedImage}
                            alt="Captured photo preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Action Bar - Hidden in face scan mode until capture */}
            {(!showFaceOverlay || capturedImage || error) && (
                <div className="flex items-center justify-center gap-4 px-6 py-6 bg-black/80 shrink-0">
                    {!capturedImage && !error && !loading && !showFaceOverlay && (
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
                                <RefreshCw className="mr-2 h-4 w-4" /> {showFaceOverlay ? 'Scan again' : 'Retake'}
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
            )}
        </div>
    );

    return createPortal(modal, document.body);
}
