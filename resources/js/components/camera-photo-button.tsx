import { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, MoreVertical, Eye, RefreshCw, Trash2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CameraPhotoButtonProps {
    placeholder: string;
    hasPhoto: boolean;
    savedUrl?: string;
    capturedFile?: File | null;
    onCapture: () => void;
    onUpload?: (file: File) => void;
    onRemove: () => void;
    disabled?: boolean;
    isFaceScan?: boolean;
}

export function CameraPhotoButton({
    placeholder,
    hasPhoto,
    savedUrl,
    capturedFile,
    onCapture,
    onUpload,
    onRemove,
    disabled,
    isFaceScan = false,
}: CameraPhotoButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageReady, setImageReady] = useState(false);

    useEffect(() => {
        let url: string | null = null;
        if (capturedFile) {
            url = URL.createObjectURL(capturedFile);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(savedUrl || null);
        }
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [capturedFile, savedUrl]);

    const openPreview = (url: string) => {
        setImageReady(false);
        setPreviewUrl(null);
        setViewOpen(true);
        setTimeout(() => setPreviewUrl(url), 10);
    };

    useEffect(() => {
        if (!previewUrl) return;
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => setImageReady(true);
    }, [previewUrl]);

    const closePreview = () => setViewOpen(false);

    const handleImageLoad = () => setImageReady(true);

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onUpload) onUpload(file);
                }}
            />
            <div className="flex w-full border border-input bg-background rounded-lg overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                {hasPhoto ? (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => previewUrl && openPreview(previewUrl)}
                        className="flex-1 flex items-center gap-2.5 px-3 h-10 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors disabled:opacity-50"
                    >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-foreground font-medium">Photo captured</span>
                    </button>
                ) : (
                    <div className="flex-1 flex items-center">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onCapture}
                            className="flex-1 flex items-center gap-2.5 px-3 h-10 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors disabled:opacity-50"
                        >
                            <Camera className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>Take Photo</span>
                        </button>

                        {onUpload && (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center gap-2.5 px-3 h-10 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors disabled:opacity-50 border-l border-input/50"
                            >
                                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>Upload</span>
                            </button>
                        )}
                    </div>
                )}

                {hasPhoto && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-none border-l border-input text-muted-foreground hover:text-foreground"
                                aria-label="Photo options"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {previewUrl && (
                                <DropdownMenuItem onClick={() => openPreview(previewUrl)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Photo
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={onCapture}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {isFaceScan ? 'Scan again' : onUpload ? 'Retake with Camera' : 'Retake Photo'}
                            </DropdownMenuItem>
                            {onUpload && (
                                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={onRemove}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Remove Photo
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {viewOpen && previewUrl && imageReady && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)' }}
                    className="flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closePreview}
                >
                    <div className="relative group max-w-full max-h-[90vh]">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full h-8 w-8 transition-all flex items-center justify-center shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                closePreview();
                            }}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <img
                            src={previewUrl}
                            alt="Photo preview"
                            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                            onLoad={handleImageLoad}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
