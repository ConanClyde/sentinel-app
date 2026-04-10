import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Check,
    X,
    ChevronLeft,
    User,
    Mail,
    IdCard,
    Car,
    ShieldCheck,
    FileText,
    ExternalLink,
    AlertTriangle,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Vehicle {
    id: number;
    vehicle_type: { name: string };
    plate_number: string;
}

interface PendingRegistration {
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
    face_scan_data?: string;
    student_school_id_image?: string;
    created_at: string;
    vehicles: Vehicle[];
}

interface Props {
    pendingRegistration: PendingRegistration;
}

export default function PendingRegistrationShow({ pendingRegistration }: Props) {
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const { post: approve, processing: approving } = useForm();
    const { data, setData, post: reject, processing: rejecting, errors } = useForm({
        notes: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pending Approvals', href: route('admin.pending-registrations.index') },
        { title: 'Verify Registrant', href: '#' },
    ];

    const getFileUrl = (path: string) => {
        // We use the custom admin.files.show route
        return route('admin.files.show', { path: path.replace(/\//g, '|') });
    };

    const handleApprove = () => {
        if (confirm(`Are you sure you want to approve ${pendingRegistration.first_name}'s registration?`)) {
            approve(route('admin.pending-registrations.approve', { id: pendingRegistration.id }));
        }
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        reject(route('admin.pending-registrations.reject', { id: pendingRegistration.id }), {
            onSuccess: () => setIsRejectDialogOpen(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verify: ${pendingRegistration.first_name} ${pendingRegistration.surname}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full pb-24">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-foreground">
                        <Link href={route('admin.pending-registrations.index')}>
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Submitted {new Date(pendingRegistration.created_at).toLocaleDateString()}
                    </div>
                </div>

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 border-muted/30">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center border-2 border-primary/20 shadow-inner">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter text-foreground">
                                    {pendingRegistration.first_name} {pendingRegistration.surname}
                                </h1>
                                <Badge className="bg-orange-500/10 text-orange-600 border-none font-bold">
                                    PENDING VERIFICATION
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground mt-1">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Mail className="h-4 w-4" />
                                    {pendingRegistration.email}
                                </span>
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                <span className="font-bold uppercase tracking-widest text-[10px] bg-muted/50 px-2 py-0.5 rounded text-foreground">
                                    {pendingRegistration.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                         <div className="hidden md:flex flex-col items-end gap-1 px-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Record ID</span>
                            <span className="text-xs font-mono text-foreground font-bold leading-none">#REG-{pendingRegistration.id.toString().padStart(5, '0')}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Identity Details */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <Card className="border-muted/40 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/10 border-b border-muted/20">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <IdCard className="h-5 w-5 text-primary" />
                                    Personal Identity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                                <DetailItem label="Full Name" value={`${pendingRegistration.first_name} ${pendingRegistration.middle_name || ''} ${pendingRegistration.surname} ${pendingRegistration.name_extension || ''}`} />
                                <DetailItem label="Role" value={pendingRegistration.role} />

                                {pendingRegistration.student_id && (
                                    <>
                                        <DetailItem label="Student ID" value={pendingRegistration.student_id} />
                                        <DetailItem label="College" value={pendingRegistration.college?.name} />
                                        <DetailItem label="Program" value={pendingRegistration.program?.name} span={2} />
                                    </>
                                )}

                                {pendingRegistration.staff_id && (
                                    <DetailItem label="Staff ID" value={pendingRegistration.staff_id} />
                                )}

                                {pendingRegistration.stakeholder_type && (
                                    <DetailItem label="Stakeholder Type" value={pendingRegistration.stakeholder_type} />
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehicles Section */}
                        <Card className="border-muted/40 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Car className="h-5 w-5 text-primary" />
                                    Vehicle Registration
                                </CardTitle>
                                <Badge variant="outline" className="border-muted/50 font-bold uppercase tracking-tight text-[10px]">
                                    {pendingRegistration.vehicles.length} VEHICLE(S)
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0 border-t border-muted/20">
                                <div className="flex flex-col divide-y divide-muted/20">
                                    {pendingRegistration.vehicles.map((v, i) => (
                                        <div key={v.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-muted/30 flex items-center justify-center font-bold text-xs">
                                                    #{i + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">{v.vehicle_type.name}</span>
                                                    <span className="text-xs text-muted-foreground uppercase tracking-widest">{v.plate_number || 'No Plate'}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none">
                                                Active
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Documents */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] pl-1">Compliance Documents</h2>

                        {/* Document List */}
                        <div className="flex flex-col gap-4">
                            {pendingRegistration.license_image && (
                                <DocCard
                                    label="Driver's License"
                                    imageUrl={getFileUrl(pendingRegistration.license_image)}
                                />
                            )}
                            {pendingRegistration.student_id_image && (
                                <DocCard
                                    label="School ID Card"
                                    imageUrl={getFileUrl(pendingRegistration.student_id_image)}
                                />
                            )}
                            {pendingRegistration.face_scan_data && (
                                <DocCard
                                    label="Verification Selfie"
                                    imageUrl={getFileUrl(pendingRegistration.face_scan_data)}
                                />
                            )}
                            {pendingRegistration.student_school_id_image && (
                                <DocCard
                                    label="Dependent ID Card"
                                    imageUrl={getFileUrl(pendingRegistration.student_school_id_image)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl flex justify-center pointer-events-none px-4 z-50">
                    <div className="bg-background/95 backdrop-blur-md border-[3px] border-muted/50 p-3 rounded-full shadow-2xl flex items-center gap-3 pointer-events-auto ring-8 ring-background/50">
                        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="rounded-full h-12 px-8 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700 font-bold tracking-tighter transition-all">
                                    <X className="mr-2 h-5 w-5" />
                                    Reject Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <form onSubmit={handleReject}>
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black tracking-tight text-red-600">Reject Registration</DialogTitle>
                                        <DialogDescription>
                                            Please provide a reason for rejecting this registration. This will be sent to the user via email.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Rejection Reason</Label>
                                            <Input
                                                id="notes"
                                                placeholder="e.g. Invalid license photo, mismatched ID..."
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                className="h-12"
                                                autoFocus
                                            />
                                            {errors.notes && <p className="text-xs text-red-500 font-bold">{errors.notes}</p>}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit" variant="destructive" disabled={rejecting || !data.notes}>
                                            Confirm Rejection
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <div className="h-8 w-px bg-muted/40 mx-2" />

                        <Button
                            className="rounded-full h-12 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-tighter shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                            onClick={handleApprove}
                            disabled={approving || rejecting}
                        >
                            <Check className="h-5 w-5 stroke-[3]" />
                            Approve Registration
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function DetailItem({ label, value, span = 1 }: { label: string; value?: string; span?: number }) {
    return (
        <div className={`flex flex-col gap-1 ${span === 2 ? 'sm:col-span-2' : ''}`}>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</span>
            <span className="text-sm font-bold text-foreground leading-tight tracking-tight">{value || '--'}</span>
        </div>
    );
}

function DocCard({ label, imageUrl }: { label: string; imageUrl: string }) {
    return (
        <Card className="border-muted/40 overflow-hidden group shadow-sm hover:border-primary/30 transition-all">
            <div className="bg-muted/10 p-2 flex items-center justify-between border-b border-muted/20">
                <span className="text-[10px] font-black uppercase tracking-widest pl-1">{label}</span>
                <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-6 w-6 rounded bg-background border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
            <div className="relative aspect-video bg-black/5 flex items-center justify-center overflow-hidden">
                <img
                    src={imageUrl}
                    alt={label}
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </Card>
    );
}
