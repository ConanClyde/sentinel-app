import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
} from '@/components/modal-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, Car, Info, RefreshCw, Tag } from 'lucide-react';
import { useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface StickerColor {
    name: string;
    hex_code: string;
}

interface VehicleType {
    id: number;
    name: string;
}

interface VehicleRow {
    id: number;
    plate_number: string | null;
    sticker_number: string | null;
    is_active: boolean;
    expires_at: string | null;
    vehicle_type?: VehicleType;
    sticker_color?: StickerColor;
    renewal_eligible: boolean;
    has_pending_request: boolean;
}

interface MyRequest {
    id: number;
    type: 'renewal' | 'replacement';
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    created_at: string;
    vehicle?: { plate_number: string | null; vehicle_type?: VehicleType };
}

interface Props {
    vehicles: VehicleRow[];
    myRequests: MyRequest[];
    replacementReasons: Record<string, string>;
    myRequestsPagination?: { current_page: number; last_page: number; total: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Registry', href: route('shared.vehicles') },
    { title: 'Sticker Requests', href: route('shared.sticker-requests') },
];

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
}

function isExpiringSoon(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 14;
}

const requestTypeBadgeClass: Record<'renewal' | 'replacement', string> = {
    renewal: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    replacement: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const statusBadgeClass: Record<'pending' | 'approved' | 'rejected', string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function StickerRequests({ vehicles, myRequests, replacementReasons, myRequestsPagination }: Props) {
    const [requestModal, setRequestModal] = useState<{
        open: boolean;
        vehicle: VehicleRow | null;
        type: 'renewal' | 'replacement';
    } | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm<{
        vehicle_id: number;
        type: 'renewal' | 'replacement';
        reason: string;
        notes: string;
    }>({
        vehicle_id: 0,
        type: 'renewal',
        reason: '',
        notes: '',
    });

    const openModal = (vehicle: VehicleRow, type: 'renewal' | 'replacement') => {
        setRequestModal({ open: true, vehicle, type });
        setData({
            vehicle_id: vehicle.id,
            type,
            reason: '',
            notes: '',
        });
    };

    const closeModal = () => {
        setRequestModal((prev) => (prev ? { ...prev, open: false } : null));
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('shared.sticker-requests.store'), {
            onSuccess: () => {
                closeModal();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sticker Requests" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Sticker Requests</h1>
                    <p className="text-muted-foreground text-sm">Request a sticker renewal or replacement for your registered vehicles.</p>
                </div>

                {/* Your Vehicles */}
                <div>
                    <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">Your Vehicles</h2>

                    {vehicles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                            <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                                <Car className="text-muted-foreground h-7 w-7" />
                            </div>
                            <p className="text-base font-medium">No vehicles registered</p>
                            <p className="text-muted-foreground mt-1 text-sm">Register a vehicle first to request stickers.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {vehicles.map((vehicle) => {
                                const expired = isExpired(vehicle.expires_at);
                                const expiringSoon = !expired && isExpiringSoon(vehicle.expires_at);

                                return (
                                    <div key={vehicle.id} className="bg-card flex flex-col rounded-lg border p-4 shadow-sm">
                                        {/* Plate + type + status badge */}
                                        <div className="mb-3 flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-mono text-lg leading-tight font-bold">
                                                    {vehicle.plate_number ?? 'No Plate'}
                                                </p>
                                                <p className="text-muted-foreground text-xs">{vehicle.vehicle_type?.name ?? '—'}</p>
                                            </div>
                                            <div className="shrink-0">
                                                {expired ? (
                                                    <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-600">
                                                        Expired
                                                    </Badge>
                                                ) : expiringSoon ? (
                                                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-600">
                                                        Expiring Soon
                                                    </Badge>
                                                ) : vehicle.is_active ? (
                                                    <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-600">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Inactive</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sticker info */}
                                        <div className="mb-2 flex items-center gap-1.5 text-sm">
                                            <Tag className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                                            {vehicle.sticker_number ? (
                                                <div className="flex items-center gap-1.5">
                                                    {vehicle.sticker_color && (
                                                        <span
                                                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                                                            style={{ backgroundColor: vehicle.sticker_color.hex_code }}
                                                        />
                                                    )}
                                                    <span className="font-mono text-xs">{vehicle.sticker_number}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">No sticker</span>
                                            )}
                                        </div>

                                        {/* Expiry */}
                                        <div className="text-muted-foreground mb-4 flex items-center gap-1.5 text-xs">
                                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                                            <span>Expires: {formatDate(vehicle.expires_at)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto">
                                            {vehicle.has_pending_request ? (
                                                <Badge
                                                    variant="outline"
                                                    className="w-full justify-center border-amber-500/20 bg-amber-500/10 py-1.5 text-amber-600"
                                                >
                                                    Pending Request
                                                </Badge>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="w-full">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full"
                                                                        disabled={!vehicle.renewal_eligible}
                                                                        onClick={() => openModal(vehicle, 'renewal')}
                                                                    >
                                                                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                                                        Request Renewal
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            {!vehicle.renewal_eligible && (
                                                                <TooltipContent>
                                                                    <p>Not eligible yet — opens 14 days before expiry</p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => openModal(vehicle, 'replacement')}
                                                    >
                                                        Request Replacement
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* My Request History */}
                {myRequests.length > 0 && (
                    <div>
                        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">My Request History</h2>

                        {/* Desktop table */}
                        <div className="bg-card hidden overflow-x-auto rounded-lg border md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Vehicle</TableHead>
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Reason</TableHead>
                                        <TableHead className="font-semibold">Submitted</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {myRequests.map((req) => (
                                        <TableRow key={req.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-medium">{req.vehicle?.plate_number ?? '—'}</span>
                                                    <span className="text-muted-foreground text-xs">{req.vehicle?.vehicle_type?.name ?? '—'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn('capitalize', requestTypeBadgeClass[req.type])}>
                                                    {req.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{req.reason ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatDate(req.created_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" className={cn('capitalize', statusBadgeClass[req.status])}>
                                                        {req.status}
                                                    </Badge>
                                                    {req.status === 'rejected' && req.notes && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Info className="text-muted-foreground h-3.5 w-3.5 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[220px]">
                                                                    <p>{req.notes}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile cards */}
                        <div className="flex flex-col gap-2 md:hidden">
                            {myRequests.map((req) => (
                                <div key={req.id} className="bg-card rounded-lg border p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <span className="font-mono font-medium">{req.vehicle?.plate_number ?? '—'}</span>
                                            <p className="text-muted-foreground text-xs">{req.vehicle?.vehicle_type?.name ?? '—'}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <Badge variant="outline" className={cn('capitalize', statusBadgeClass[req.status])}>
                                                {req.status}
                                            </Badge>
                                            {req.status === 'rejected' && req.notes && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="text-muted-foreground h-3.5 w-3.5 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[220px]">
                                                            <p>{req.notes}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                        <Badge variant="outline" className={cn('capitalize', requestTypeBadgeClass[req.type])}>
                                            {req.type}
                                        </Badge>
                                        {req.reason && <span className="text-muted-foreground text-xs">{req.reason}</span>}
                                    </div>

                                    <p className="text-muted-foreground mt-2 text-xs">{formatDate(req.created_at)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Pagination for My Request History */}
            <div className="hidden md:block">
                {myRequestsPagination && myRequestsPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('shared.sticker-requests') + '?page=' + (myRequestsPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: myRequestsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('shared.sticker-requests') + '?page=' + page} isActive={myRequestsPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('shared.sticker-requests') + '?page=' + (myRequestsPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination for My Request History */}
            {myRequestsPagination && myRequestsPagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={route('shared.sticker-requests') + '?page=' + (myRequestsPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: myRequestsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('shared.sticker-requests') + '?page=' + page} isActive={myRequestsPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('shared.sticker-requests') + '?page=' + (myRequestsPagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Submit Request ModalDrawer */}
            <ModalDrawer
                open={requestModal?.open ?? false}
                onOpenChange={(v) => {
                    if (!v) closeModal();
                }}
            >
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Request Sticker {requestModal?.type === 'renewal' ? 'Renewal' : 'Replacement'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            For vehicle: <span className="font-mono font-semibold">{requestModal?.vehicle?.plate_number ?? '—'}</span>
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {requestModal?.type === 'renewal' ? (
                            <div className="bg-muted/30 text-muted-foreground rounded-lg border p-4 text-sm leading-relaxed">
                                You are requesting a renewal for{' '}
                                <span className="text-foreground font-mono font-semibold">{requestModal.vehicle?.plate_number ?? '—'}</span>. Your
                                sticker will be extended with a new expiry date upon approval.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="replacement-reason">
                                        Reason for Replacement <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.reason} onValueChange={(v) => setData('reason', v)} required>
                                        <SelectTrigger id="replacement-reason">
                                            <SelectValue placeholder="Select a reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(replacementReasons).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.reason && <p className="text-destructive text-xs">{errors.reason}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="replacement-notes">
                                        Additional Notes <span className="text-muted-foreground text-xs">(optional)</span>
                                    </Label>
                                    <Textarea
                                        id="replacement-notes"
                                        placeholder="Any additional information..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}

                        <ModalDrawerFooter className="flex-row gap-2 px-0">
                            <Button type="button" variant="outline" className="flex-1" onClick={closeModal} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={processing}>
                                {processing ? 'Submitting…' : 'Submit Request'}
                            </Button>
                        </ModalDrawerFooter>
                    </form>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
