import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Check,
    X,
    ChevronLeft,
    IdCard,
    Car,
    ShieldCheck,
    FileText,
    ExternalLink,
    AlertTriangle,
    Clock,
    UserCheck,
    AlertCircle,
    ScanFace,
    ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
    ModalDrawerTrigger
} from '@/components/modal-drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/user-avatar';

interface Vehicle {
    id: number;
    vehicle_type: { name: string };
    plate_number: string;
}

interface PendingApproval {
    id: number;
    first_name: string;
    middle_name?: string;
    surname: string;
    name_extension?: string;
    email: string;
    role: string;
    student_id?: string;
    staff_id?: string;
    stakeholder_type?: string;
    college?: { name: string };
    program?: { name: string };
    license_image?: string;
    student_id_image?: string;
    staff_id_image?: string;
    face_scan_data?: string;
    student_school_id_image?: string;
    created_at: string;
    vehicles: Vehicle[];
}

interface Props {
    pendingRegistration: PendingApproval;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pending Approvals', href: route('admin.pending-approvals.index') },
    { title: 'Verification Workspace', href: '#' },
];

export default function PendingApprovalShow({ pendingRegistration }: Props) {
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<{ url: string; label: string } | null>(null);

    const { post: approve, processing: approving } = useForm();
    const { data, setData, post: reject, processing: rejecting, errors } = useForm({
        notes: '',
    });

    const getFileUrl = (path: string) => {
        return route('admin.files.show', { path: path.replace(/\//g, '|') });
    };

    const handleApprove = () => {
        approve(route('admin.pending-approvals.approve', { id: pendingRegistration.id }), {
            onSuccess: () => setIsApproveDialogOpen(false),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        reject(route('admin.pending-approvals.reject', { id: pendingRegistration.id }), {
            onSuccess: () => setIsRejectDialogOpen(false),
        });
    };

    const getPrimaryIdImage = () => {
        // For Students, the Student ID is the primary verification document
        if (pendingRegistration.role === 'Student' && pendingRegistration.student_id_image) {
            return getFileUrl(pendingRegistration.student_id_image);
        }

        // For Staff, the Staff ID is the primary verification document
        if (pendingRegistration.role === 'Staff' && pendingRegistration.staff_id_image) {
            return getFileUrl(pendingRegistration.staff_id_image);
        }

        // For all others (Stakeholders/Guardians), use the License/Official ID
        if (pendingRegistration.license_image) {
            return getFileUrl(pendingRegistration.license_image);
        }

        return null;
    };

    const getPrimaryIdLabel = () => {
        if (pendingRegistration.role === 'Student' && pendingRegistration.student_id_image) {
            return "University ID Card";
        }
        if (pendingRegistration.role === 'Staff' && pendingRegistration.staff_id_image) {
            return "Staff ID Card";
        }
        if (pendingRegistration.license_image) {
            return "Driver's License";
        }
        return "Primary Identification";
    };

    const registrationId = `#REG-${pendingRegistration.id.toString().padStart(5, '0')}`;

    const middleInitial = pendingRegistration.middle_name ? `${pendingRegistration.middle_name.charAt(0).toUpperCase()}. ` : '';
    const nameExt = pendingRegistration.name_extension ? ` ${pendingRegistration.name_extension}` : '';
    const registrantName = `${pendingRegistration.first_name} ${middleInitial}${pendingRegistration.surname}${nameExt}`.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verify: ${pendingRegistration.first_name} ${pendingRegistration.surname}`} />

            <div className="flex flex-col h-full">
                {/* Secondary Context Navbar - Full-Width Fixed */}
                <div className="fixed top-[64px] left-0 right-0 z-30 bg-background border-b px-4 md:px-6 lg:px-8 py-3.5 md:py-2.5 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8 -ml-1">
                                <Link href={route('admin.pending-approvals.index')}>
                                    <ChevronLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-bold tracking-tight text-neutral-900 capitalize">
                                        {pendingRegistration.first_name} {pendingRegistration.middle_name ? `${pendingRegistration.middle_name.charAt(0).toUpperCase()}. ` : ''}{pendingRegistration.surname} {pendingRegistration.name_extension}
                                    </h1>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold uppercase tracking-wider py-0 px-2 h-5">
                                        PENDING
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{new Date(pendingRegistration.created_at).toLocaleDateString()}</span>
                                    <span className="text-neutral-300">|</span>
                                    <span className="font-mono text-neutral-600">{registrationId}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Spacer to push content below the fixed header */}
                <div className="h-24 md:h-16 w-full" />

                <div className="w-full">
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start pb-28">
                    {/* Left Panel: Identity & Details (Second on Mobile) */}
                    <div className="lg:col-span-7 space-y-6 lg:order-first">
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/40 py-3 px-5">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <IdCard className="h-3.5 w-3.5 text-primary" />
                                    Identity Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-border/30">
                                    <DetailField label="Full Legal Name" value={`${pendingRegistration.first_name} ${pendingRegistration.middle_name || ''} ${pendingRegistration.surname} ${pendingRegistration.name_extension || ''}`} span={2} />
                                    <DetailField label="Official Email" value={pendingRegistration.email} />
                                    <DetailField label="Registrant Role" value={pendingRegistration.role} highlight />

                                    {pendingRegistration.student_id && (
                                        <>
                                            <DetailField label="Student ID Number" value={pendingRegistration.student_id} />
                                            <DetailField label="Assigned College" value={pendingRegistration.college?.name} />
                                            <DetailField label="Academic Program" value={pendingRegistration.program?.name} span={2} />
                                        </>
                                    )}

                                    {pendingRegistration.staff_id && (
                                        <DetailField label="Employee ID Number" value={pendingRegistration.staff_id} />
                                    )}

                                    {pendingRegistration.stakeholder_type && (
                                        <DetailField label="Stakeholder Category" value={pendingRegistration.stakeholder_type} />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/40 py-3 px-5 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Car className="h-3.5 w-3.5 text-primary" />
                                    Vehicle Entries
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] font-bold opacity-60">
                                    {pendingRegistration.vehicles.length} UNIT(S)
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        {pendingRegistration.vehicles.length > 0 ? (
                                            pendingRegistration.vehicles.map((v, i) => (
                                                <TableRow key={v.id} className="hover:bg-muted/10">
                                                    <TableCell className="w-12 text-muted-foreground font-mono text-xs pl-5">#{i + 1}</TableCell>
                                                    <TableCell className="font-bold text-sm">{v.vehicle_type.name}</TableCell>
                                                    <TableCell className="font-mono text-primary font-bold text-sm tracking-tighter uppercase">{v.plate_number || 'NO PLATE'}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-xs uppercase font-bold tracking-widest opacity-40">
                                                    No vehicle records attached to this request
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Panel: Biometric Sidebar (First on Mobile) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20 order-first lg:order-last">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <ScanFace className="h-3 w-3" />
                                Biometric Check
                            </h2>
                        </div>

                        {/* Side-by-Side Biometric Module */}
                        <div className="grid grid-cols-2 gap-px rounded-lg border bg-muted/20 overflow-hidden">
                            <BiometricPreview
                                label="Registrant Face"
                                imageUrl={pendingRegistration.face_scan_data ? getFileUrl(pendingRegistration.face_scan_data) : null}
                                onZoom={(url) => setZoomImage({ url, label: 'Registrant Face' })}
                            />
                            <BiometricPreview
                                label={getPrimaryIdLabel()}
                                imageUrl={getPrimaryIdImage()}
                                onZoom={(url) => setZoomImage({ url, label: getPrimaryIdLabel() })}
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Full Document Stack</h2>

                            <div className="flex flex-col gap-3">
                                {pendingRegistration.license_image && (
                                    <EvidenceMiniCard
                                        label="Driver's License"
                                        imageUrl={getFileUrl(pendingRegistration.license_image)}
                                        onZoom={(url) => setZoomImage({ url, label: "Driver's License" })}
                                    />
                                )}
                                {pendingRegistration.student_id_image && (
                                    <EvidenceMiniCard
                                        label="University ID Card"
                                        imageUrl={getFileUrl(pendingRegistration.student_id_image)}
                                        onZoom={(url) => setZoomImage({ url, label: "University ID Card" })}
                                    />
                                )}
                                {pendingRegistration.staff_id_image && (
                                    <EvidenceMiniCard
                                        label="Staff ID Card"
                                        imageUrl={getFileUrl(pendingRegistration.staff_id_image)}
                                        onZoom={(url) => setZoomImage({ url, label: "Staff ID Card" })}
                                    />
                                )}
                                {pendingRegistration.student_school_id_image && (
                                    <EvidenceMiniCard
                                        label="External School ID"
                                        imageUrl={getFileUrl(pendingRegistration.student_school_id_image)}
                                        onZoom={(url) => setZoomImage({ url, label: "External School ID" })}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-orange-500/5 border border-orange-200/40 p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Verification Standard</span>
                                <p className="text-xs text-orange-600/80 leading-relaxed">
                                    Ensure that the facial scan matches the photograph provided on the official identification document.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Action Bar - Full-Width Bottom Navbar */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 md:px-6 lg:px-8 py-3.5 md:py-2.5 z-40 transition-all">
                    <div className="w-full flex items-center justify-center md:justify-end gap-3 px-4 md:px-8">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <ModalDrawer open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                <ModalDrawerTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 sm:flex-none h-11 px-6 text-white"
                                    >
                                        <X className="mr-2 h-4 w-4 stroke-[3]" />
                                        Reject
                                    </Button>
                                </ModalDrawerTrigger>
                                <ModalDrawerContent className="sm:max-w-md">
                                    <form onSubmit={handleReject}>
                                        <ModalDrawerHeader>
                                            <ModalDrawerTitle className="flex items-center gap-2 text-destructive">
                                                <AlertTriangle className="h-5 w-5" />
                                                Confirm Rejection
                                            </ModalDrawerTitle>
                                            <ModalDrawerDescription className="text-sm">
                                                Please provide a clear justification for rejecting this registration request.
                                            </ModalDrawerDescription>
                                        </ModalDrawerHeader>
                                        <div className="py-4 space-y-3">
                                            <Label htmlFor="notes" className="text-[10px] font-bold uppercase text-muted-foreground">Admin Feedback</Label>
                                            <Input
                                                id="notes"
                                                placeholder="e.g. Identity photo is blurry, expired ID card..."
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                autoFocus
                                                className="h-10 text-sm"
                                            />
                                            {errors.notes && <p className="text-xs text-red-500 font-bold">{errors.notes}</p>}
                                        </div>
                                        <ModalDrawerFooter className="flex-row gap-2">
                                            <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="flex-1">Cancel</Button>
                                            <Button type="submit" variant="destructive" className="flex-1 px-6 text-white" disabled={rejecting || !data.notes}>
                                                Reject Request
                                            </Button>
                                        </ModalDrawerFooter>
                                    </form>
                                </ModalDrawerContent>
                            </ModalDrawer>

                            <ModalDrawer open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                                <ModalDrawerTrigger asChild>
                                    <Button
                                        size="lg"
                                        variant="success"
                                        className="flex-1 sm:flex-none h-11 px-8 transition-all active:scale-[0.98] border-none"
                                        disabled={approving || rejecting}
                                    >
                                        <Check className="mr-2 h-5 w-5 stroke-[4]" />
                                        Approve
                                    </Button>
                                </ModalDrawerTrigger>
                                <ModalDrawerContent className="sm:max-w-md">
                                    <ModalDrawerHeader>
                                        <ModalDrawerTitle className="flex items-center gap-2 text-success font-bold text-xl">
                                            <ShieldCheck className="h-6 w-6" />
                                            Confirm Approval
                                        </ModalDrawerTitle>
                                        <ModalDrawerDescription className="text-sm leading-relaxed mt-2">
                                            Are you sure you want to approve <span className="font-bold text-foreground">{registrantName}</span>'s registration? This will generate the sticker details and notify the user via email.
                                        </ModalDrawerDescription>
                                    </ModalDrawerHeader>
                                    <ModalDrawerFooter className="flex-row gap-4 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsApproveDialogOpen(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleApprove}
                                            variant="success"
                                            className="flex-1 h-11 px-6 shadow-sm transition-all active:scale-[0.98] border-none"
                                            disabled={approving}
                                        >
                                            {approving ? 'Approving...' : 'Confirm Approval'}
                                        </Button>
                                    </ModalDrawerFooter>
                                </ModalDrawerContent>
                            </ModalDrawer>
                        </div>
                    </div>
                </div>
                </div>

                {/* Lightbox Modal (Registration Pattern Alignment) */}
                {zoomImage && (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)' }}
                        className="flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setZoomImage(null)}
                    >
                        <div className="relative group max-w-full max-h-[90vh]">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full h-8 w-8 transition-all flex items-center justify-center shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomImage(null);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <img
                                src={zoomImage.url}
                                alt={zoomImage.label}
                                className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl border border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="absolute -bottom-10 left-0 right-0 text-center">
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em]">{zoomImage.label}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function DetailField({ label, value, span = 1, highlight = false }: { label: string; value?: string; span?: number; highlight?: boolean }) {
    return (
        <div className={cn(
            "p-5 flex flex-col gap-1.5",
            span === 2 ? 'sm:col-span-2' : ''
        )}>
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">{label}</Label>
            <div className={cn(
                "text-[13px] font-semibold text-foreground leading-tight",
                highlight && "text-primary font-bold"
            )}>
                {value || '--'}
            </div>
        </div>
    );
}

function BiometricPreview({ label, imageUrl, onZoom }: { label: string; imageUrl: string | null; onZoom: (url: string) => void }) {
    return (
        <div className="flex flex-col bg-white overflow-hidden group">
            <div className="bg-muted/50 px-2 py-1.5 border-b flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
                <ScanFace className="h-2.5 w-2.5 text-primary opacity-40" />
            </div>
            <div className="relative aspect-[3/4] bg-muted/10 flex items-center justify-center p-2 cursor-pointer" onClick={() => imageUrl && onZoom(imageUrl)}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={label}
                        className="h-full w-full object-cover rounded shadow-inner"
                    />
                ) : (
                    <AlertCircle className="h-6 w-6 text-muted-foreground/20" />
                )}
                {imageUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
}

function EvidenceMiniCard({ label, imageUrl, onZoom }: { label: string; imageUrl: string; onZoom: (url: string) => void }) {
    return (
        <button
            onClick={() => onZoom(imageUrl)}
            className="w-full flex items-center justify-between p-3 rounded-lg border bg-card/40 hover:bg-muted/30 transition-colors group text-left outline-none focus:ring-2 focus:ring-primary/20"
        >
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded border overflow-hidden bg-muted">
                    <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-[11px] font-bold text-foreground leading-tight">{label}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">Document Scan</span>
                </div>
            </div>
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-[#f4f4f5] text-foreground border shadow-sm ring-1 ring-black/5 transition-transform active:scale-90">
                <ZoomIn className="h-4.5 w-4.5" />
            </div>
        </button>
    );
}
