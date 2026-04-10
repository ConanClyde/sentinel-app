import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Camera, CheckCircle2, MoreVertical, Eye, RefreshCw, Trash2, X, Upload } from 'lucide-react';
import { FormEventHandler, useState, useEffect, useRef } from 'react';
import { CameraCaptureDialog } from '@/components/camera-capture-dialog';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProgramCombobox } from '@/components/program-combobox';
import AuthLayout from '@/layouts/auth-layout';

// ── Reusable Camera Photo Button ──────────────────────────────────────────────
interface CameraPhotoButtonProps {
    /** Label shown when no photo taken */
    placeholder: string;
    /** Whether a photo exists (new capture OR saved from server) */
    hasPhoto: boolean;
    /** URL/path of saved server-side image (for View) */
    savedUrl?: string;
    /** New File captured in this session (for View) */
    capturedFile?: File | null;
    /** Open camera dialog */
    onCapture: () => void;
    /** Upload a file manually */
    onUpload?: (file: File) => void;
    /** Remove the current photo */
    onRemove: () => void;
    disabled?: boolean;
    isFaceScan?: boolean;
}

function CameraPhotoButton({
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
        // If image already preloaded, show immediately
        if (imageReady && previewUrl === url) {
            setViewOpen(true);
            return;
        }
        // Otherwise trigger preload and show modal once ready
        setImageReady(false);
        setPreviewUrl(url);
        setViewOpen(true);
    };

    // Preload image in background
    useEffect(() => {
        if (!previewUrl) return;
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => setImageReady(true);
    }, [previewUrl]);

    const closePreview = () => {
        setViewOpen(false);
        setImageReady(false);
    };

    const handleImageLoad = () => {
        setImageReady(true);
    };

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
            <div className="flex w-full border border-input bg-background rounded-md overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                {/* Left main area */}
                {hasPhoto ? (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => previewUrl && openPreview(previewUrl)}
                        className="flex-1 flex items-center gap-2.5 px-3 h-12 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors disabled:opacity-50"
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
                            className="flex-1 flex items-center gap-2.5 px-3 h-12 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors disabled:opacity-50 border-r border-input/50"
                        >
                            <Camera className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>Take Photo</span>
                        </button>

                        {onUpload && (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center gap-2.5 px-3 h-12 text-sm font-normal text-left truncate hover:bg-muted/40 transition-colors disabled:opacity-50"
                            >
                                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>Upload</span>
                            </button>
                        )}

                        {!onUpload && (
                            <div className="flex items-center gap-2.5 px-3 h-12 text-sm font-normal text-muted-foreground truncate">
                                <span>{placeholder}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 3-dot menu — only when photo is present */}
                {hasPhoto && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-12 w-10 shrink-0 rounded-none border-l border-input text-muted-foreground hover:text-foreground"
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

            {/* Lightbox preview */}
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
                            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                            onLoad={handleImageLoad}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

interface Program {
    id: number;
    name: string;
    code: string;
}

interface College {
    id: number;
    name: string;
    code: string;
    programs: Program[];
}

interface SavedRoleData {
    student_id?: string;
    college_id?: string;
    program_id?: string;
    staff_id?: string;
    stakeholder_type?: string;
    student_id_image?: string;
    face_scan_data?: string;
    license_image?: string;
    student_school_id_image?: string;
}

interface RegisterRoleSpecificProps {
    role: string;
    colleges: College[];
    savedData?: SavedRoleData;
}

interface RegisterRoleSpecificForm {
    [key: string]: string | File | null | undefined;
    // Student
    student_id: string;
    college_id: string;
    program_id: string;
    student_id_image: File | null | undefined;
    // Staff
    staff_id: string;
    // Stakeholder
    stakeholder_type: string;
    student_school_id_image: File | null | undefined;
    // Common
    face_scan_data: File | null | undefined;
    license_image: File | null | undefined;
}

export default function RegisterRoleSpecific({ role, colleges, savedData }: RegisterRoleSpecificProps) {
    // WebRTC dialog state – used universally on all devices
    const [cameraOpen, setCameraOpen]               = useState(false);
    const [activeCameraField, setActiveCameraField] = useState<keyof RegisterRoleSpecificForm | null>(null);
    const [activeCameraMode, setActiveCameraMode]   = useState<'user' | 'environment'>('environment');
    const [activeCameraTitle, setActiveCameraTitle] = useState('Take Photo');
    const [showFaceOverlay, setShowFaceOverlay]     = useState(false);

    const { data, setData, post, processing, errors } = useForm<RegisterRoleSpecificForm>({
        student_id: savedData?.student_id || '',
        college_id: savedData?.college_id || '',
        program_id: savedData?.program_id || '',
        student_id_image: undefined, // undefined = use savedData, null = removed
        staff_id: savedData?.staff_id || '',
        stakeholder_type: savedData?.stakeholder_type || '',
        student_school_id_image: undefined,
        face_scan_data: undefined,
        license_image: undefined,
    });

    const clearFile = (field: keyof RegisterRoleSpecificForm) => {
        setData(field, null);
    };

    const openCamera = (
        field: keyof RegisterRoleSpecificForm,
        mode: 'user' | 'environment',
        title: string,
        faceOverlay = false,
    ) => {
        setActiveCameraField(field);
        setActiveCameraMode(mode);
        setActiveCameraTitle(title);
        setShowFaceOverlay(faceOverlay);
        setCameraOpen(true);
    };

    const handleCameraCapture = (file: File) => {
        if (activeCameraField) {
            setData(activeCameraField, file);
            toast.success('Photo captured successfully.');
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.store-role-specific'), {
            onSuccess: () => toast.success('Profile details saved!'),
            onError: () => toast.error('Please resolve the errors highlighted below.'),
        });
    };

    const isStudent    = role === 'Student';
    const isStaff      = role === 'Staff';
    const isStakeholder = role === 'Stakeholder';
    const isGuardian   = data.stakeholder_type === 'Guardian';
    const roleLabel    = isStudent ? 'Student' : isStaff ? 'Staff' : 'Stakeholder';

    return (
        <AuthLayout title="Complete Your Profile" description={`Step 2 of 5: ${roleLabel} Details`} backHref={route('register.back')} progress={40}>
            <Head title="Register - Details" />
            <form className="flex flex-col gap-6" onSubmit={submit} encType="multipart/form-data">
                <div className="flex flex-col gap-4">
                    {/* Student Fields */}
                    {isStudent && (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="student_id">Student ID</Label>
                                <Input
                                    id="student_id"
                                    type="text"
                                    required
                                    value={data.student_id || ''}
                                    onChange={(e) => setData('student_id', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., 2023-12345"
                                    className="h-12 text-base"
                                />
                                <InputError message={errors.student_id} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="program_id">Program</Label>
                                <ProgramCombobox
                                    colleges={colleges}
                                    value={data.program_id || ''}
                                    onChange={(programId, collegeId) => {
                                        setData('program_id', programId);
                                        setData('college_id', collegeId);
                                    }}
                                    placeholder="Select your program"
                                    disabled={processing}
                                    error={errors.program_id}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Student ID Photo (Required)</Label>
                                <CameraPhotoButton
                                    placeholder="Take photo of student ID"
                                    hasPhoto={data.student_id_image !== null && (!!data.student_id_image || !!savedData?.student_id_image)}
                                    capturedFile={data.student_id_image as File | null}
                                    savedUrl={savedData?.student_id_image}
                                    onCapture={() => openCamera('student_id_image', 'environment', 'Scan Student ID')}
                                    onUpload={(file) => setData('student_id_image', file)}
                                    onRemove={() => clearFile('student_id_image')}
                                    disabled={processing}
                                />
                                <InputError message={errors.student_id_image} />
                            </div>
                        </>
                    )}

                    {/* Staff Fields */}
                    {isStaff && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="staff_id">Staff ID</Label>
                            <Input
                                id="staff_id"
                                type="text"
                                required
                                value={data.staff_id || ''}
                                onChange={(e) => setData('staff_id', e.target.value)}
                                disabled={processing}
                                placeholder="e.g., FAC-001"
                                className="h-12 text-base"
                            />
                            <InputError message={errors.staff_id} />
                        </div>
                    )}

                    {/* Stakeholder Fields */}
                    {isStakeholder && isGuardian && (
                        <div className="flex flex-col gap-2">
                            <Label>Student's School ID Photo (Required for Guardian)</Label>
                            <CameraPhotoButton
                                placeholder="Take photo of student school ID"
                                hasPhoto={data.student_school_id_image !== null && (!!data.student_school_id_image || !!savedData?.student_school_id_image)}
                                capturedFile={data.student_school_id_image as File | null}
                                savedUrl={savedData?.student_school_id_image}
                                onCapture={() => openCamera('student_school_id_image', 'environment', "Scan Student's ID")}
                                onUpload={(file) => setData('student_school_id_image', file)}
                                onRemove={() => clearFile('student_school_id_image')}
                                disabled={processing}
                            />
                            <InputError message={errors.student_school_id_image} />
                        </div>
                    )}

                    {/* Common Camera Captures */}
                    <div className="flex flex-col gap-2">
                        <Label>Face Scan Selfie (Required)</Label>
                        <CameraPhotoButton
                            placeholder=""
                            hasPhoto={data.face_scan_data !== null && (!!data.face_scan_data || !!savedData?.face_scan_data)}
                            capturedFile={data.face_scan_data as File | null}
                            savedUrl={savedData?.face_scan_data}
                            onCapture={() => openCamera('face_scan_data', 'user', 'Face Scan', true)}
                            onRemove={() => clearFile('face_scan_data')}
                            disabled={processing}
                            isFaceScan={true}
                        />
                        <InputError message={errors.face_scan_data} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>
                            Driver's License Photo <span className="text-muted-foreground">(Optional)</span>
                        </Label>
                        <CameraPhotoButton
                            placeholder="Take photo of driver's license"
                            hasPhoto={data.license_image !== null && (!!data.license_image || !!savedData?.license_image)}
                            capturedFile={data.license_image as File | null}
                            savedUrl={savedData?.license_image}
                            onCapture={() => openCamera('license_image', 'environment', "Scan Driver's License")}
                            onUpload={(file) => setData('license_image', file)}
                            onRemove={() => clearFile('license_image')}
                            disabled={processing}
                        />
                        <InputError message={errors.license_image} />
                    </div>

                    <Button type="submit" className="mt-2 h-12 w-full text-base transition-transform active:scale-[0.98]" disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Continue
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')}>
                        Log in
                    </TextLink>
                </div>
            </form>

            <CameraCaptureDialog
                isOpen={cameraOpen}
                onClose={() => setCameraOpen(false)}
                onCapture={handleCameraCapture}
                title={activeCameraTitle}
                facingMode={activeCameraMode}
                showFaceOverlay={showFaceOverlay}
            />
        </AuthLayout>
    );
}
