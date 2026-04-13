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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/user-avatar';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Car, CheckCircle2, MoreHorizontal, Tag, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface StickerColor {
    name: string;
    hex_code: string;
}

interface VehicleType {
    name: string;
}

interface StickerRequestAdmin {
    id: number;
    type: 'renewal' | 'replacement';
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    vehicle?: {
        plate_number: string | null;
        sticker_number: string | null;
        expires_at: string | null;
        is_active: boolean;
        vehicle_type?: VehicleType;
        sticker_color?: StickerColor;
    };
}

interface Props {
    requests: StickerRequestAdmin[];
    stickerRequestsPagination?: { current_page: number; last_page: number; total: number };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Sticker Requests', href: route('admin.sticker-requests.index') }];

const statusBadgeClass: Record<StickerRequestAdmin['status'], string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const typeBadgeClass: Record<StickerRequestAdmin['type'], string> = {
    renewal: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    replacement: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

function StatusBadge({ status }: { status: StickerRequestAdmin['status'] }) {
    return (
        <Badge variant="outline" className={cn('capitalize', statusBadgeClass[status])}>
            {status}
        </Badge>
    );
}

function TypeBadge({ type }: { type: StickerRequestAdmin['type'] }) {
    return (
        <Badge variant="outline" className={cn('capitalize', typeBadgeClass[type])}>
            {type}
        </Badge>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function StickerRequests({ requests, canManage = false, stickerRequestsPagination }: Props & { canManage?: boolean }) {
    const [approveRequest, setApproveRequest] = useState<StickerRequestAdmin | null>(null);
    const [rejectRequest, setRejectRequest] = useState<StickerRequestAdmin | null>(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = () => {
        if (!approveRequest) return;
        setIsProcessing(true);
        router.post(
            route('admin.sticker-requests.approve', approveRequest.id),
            {},
            {
                onSuccess: () => {
                    setApproveRequest(null);
                },
                onError: () => {
                    toast.error('Failed to approve. Please try again.');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleReject = () => {
        if (!rejectRequest) return;
        setIsProcessing(true);
        router.post(
            route('admin.sticker-requests.reject', rejectRequest.id),
            { notes: rejectNotes },
            {
                onSuccess: () => {
                    setRejectRequest(null);
                    setRejectNotes('');
                },
                onError: () => {
                    toast.error('Failed to reject. Please try again.');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sticker Requests" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Sticker Requests</h1>
                    <p className="text-muted-foreground text-sm">Review and process sticker renewal and replacement requests from campus members.</p>
                </div>

                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                            <Tag className="text-muted-foreground h-7 w-7" />
                        </div>
                        <p className="text-base font-medium">No sticker requests</p>
                        <p className="text-muted-foreground mt-1 text-sm">All requests have been processed.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="bg-card hidden overflow-x-auto rounded-lg border md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Submitted By</TableHead>
                                        <TableHead className="font-semibold">Vehicle</TableHead>
                                        <TableHead className="font-semibold">Request Type</TableHead>
                                        <TableHead className="font-semibold">Reason</TableHead>
                                        <TableHead className="font-semibold">Submitted</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id} className="hover:bg-muted/50">
                                            {/* Submitted By */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={request.user ?? null} size="sm" />
                                                    <div className="flex flex-col">
                                                        <span className="leading-tight font-medium">{request.user?.name ?? '—'}</span>
                                                        <span className="text-muted-foreground text-xs leading-tight">
                                                            {request.user?.email ?? '—'}
                                                        </span>
                                                        {request.user?.role && (
                                                            <Badge variant="outline" className="mt-1 w-fit px-1.5 py-0 text-[10px]">
                                                                {request.user.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Vehicle */}
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-mono font-medium">{request.vehicle?.plate_number ?? '—'}</span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {request.vehicle?.vehicle_type?.name ?? '—'}
                                                    </span>
                                                    {request.vehicle?.sticker_number && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            {request.vehicle.sticker_color && (
                                                                <span
                                                                    className="inline-block h-2 w-2 shrink-0 rounded-full border border-black/10"
                                                                    style={{ backgroundColor: request.vehicle.sticker_color.hex_code }}
                                                                />
                                                            )}
                                                            <span className="text-muted-foreground font-mono">{request.vehicle.sticker_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Request Type */}
                                            <TableCell>
                                                <TypeBadge type={request.type} />
                                            </TableCell>

                                            {/* Reason */}
                                            <TableCell className="text-muted-foreground max-w-[160px] truncate text-sm">
                                                {request.reason ?? '—'}
                                            </TableCell>

                                            {/* Submitted */}
                                            <TableCell className="text-muted-foreground text-sm">{formatDate(request.created_at)}</TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <StatusBadge status={request.status} />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <DropdownMenu modal={false}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {request.status === 'pending' && canManage && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onSelect={() => setTimeout(() => setApproveRequest(request), 0)}
                                                                    className="text-green-600 focus:text-green-600"
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onSelect={() =>
                                                                        setTimeout(() => {
                                                                            setRejectNotes('');
                                                                            setRejectRequest(request);
                                                                        }, 0)
                                                                    }
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {(request.status !== 'pending' || !canManage) && (
                                                            <DropdownMenuItem disabled className="text-muted-foreground">
                                                                No actions available
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="flex flex-col gap-2 md:hidden">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-card rounded-lg border p-4">
                                    {/* Top row: user info + 3-dot menu */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <UserAvatar user={request.user ?? null} size="sm" />
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="truncate font-medium">{request.user?.name ?? '—'}</span>
                                                    {request.user?.role && (
                                                        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                                                            {request.user.role}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-muted-foreground truncate text-xs">{request.user?.email ?? '—'}</div>
                                            </div>
                                        </div>

                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="shrink-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {request.status === 'pending' && canManage && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onSelect={() => setTimeout(() => setApproveRequest(request), 0)}
                                                            className="text-green-600 focus:text-green-600"
                                                        >
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                setTimeout(() => {
                                                                    setRejectNotes('');
                                                                    setRejectRequest(request);
                                                                }, 0)
                                                            }
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {(request.status !== 'pending' || !canManage) && (
                                                    <DropdownMenuItem disabled className="text-muted-foreground">
                                                        No actions available
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Vehicle info */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <Car className="text-muted-foreground h-4 w-4 shrink-0" />
                                        <span className="font-mono text-sm font-medium">{request.vehicle?.plate_number ?? '—'}</span>
                                        {request.vehicle?.vehicle_type?.name && (
                                            <>
                                                <span className="text-muted-foreground text-sm">·</span>
                                                <span className="text-muted-foreground text-sm">{request.vehicle.vehicle_type.name}</span>
                                            </>
                                        )}
                                        {request.vehicle?.sticker_number && (
                                            <>
                                                <span className="text-muted-foreground text-sm">·</span>
                                                <div className="flex items-center gap-1">
                                                    {request.vehicle.sticker_color && (
                                                        <span
                                                            className="inline-block h-2 w-2 shrink-0 rounded-full border border-black/10"
                                                            style={{ backgroundColor: request.vehicle.sticker_color.hex_code }}
                                                        />
                                                    )}
                                                    <span className="text-muted-foreground font-mono text-xs">{request.vehicle.sticker_number}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Type + reason */}
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <TypeBadge type={request.type} />
                                        {request.reason && <span className="text-muted-foreground text-xs">{request.reason}</span>}
                                    </div>

                                    {/* Bottom row: date + status */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs">{formatDate(request.created_at)}</span>
                                        <StatusBadge status={request.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                {stickerRequestsPagination && stickerRequestsPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('admin.sticker-requests.index') + '?page=' + (stickerRequestsPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: stickerRequestsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('admin.sticker-requests.index') + '?page=' + page} isActive={stickerRequestsPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('admin.sticker-requests.index') + '?page=' + (stickerRequestsPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {stickerRequestsPagination && stickerRequestsPagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={route('admin.sticker-requests.index') + '?page=' + (stickerRequestsPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: stickerRequestsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('admin.sticker-requests.index') + '?page=' + page} isActive={stickerRequestsPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('admin.sticker-requests.index') + '?page=' + (stickerRequestsPagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Approve ModalDrawer */}
            <ModalDrawer
                open={approveRequest !== null}
                onOpenChange={(v) => {
                    if (!v) setApproveRequest(null);
                }}
            >
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Approve Sticker Request</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {approveRequest?.type === 'renewal'
                                ? 'A new sticker will be generated with an extended expiry date.'
                                : 'The sticker will be regenerated with the same number and expiry.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <div className="space-y-4 py-2">
                        <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                            <div className="flex flex-col gap-1">
                                <Label className="text-muted-foreground text-xs">Submitted By</Label>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={approveRequest?.user ?? null} size="sm" />
                                    <div>
                                        <div className="text-sm font-medium">{approveRequest?.user?.name ?? '—'}</div>
                                        <div className="text-muted-foreground text-xs">{approveRequest?.user?.email ?? '—'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Vehicle</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-medium">{approveRequest?.vehicle?.plate_number ?? '—'}</span>
                                        {approveRequest?.vehicle?.vehicle_type?.name && (
                                            <span className="text-muted-foreground text-xs">· {approveRequest.vehicle.vehicle_type.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Request Type</Label>
                                    {approveRequest && <TypeBadge type={approveRequest.type} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ModalDrawerFooter className="flex-row gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setApproveRequest(null)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button className="flex-1 bg-green-600 text-white hover:bg-green-700" onClick={handleApprove} disabled={isProcessing}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            {/* Reject ModalDrawer */}
            <ModalDrawer
                open={rejectRequest !== null}
                onOpenChange={(v) => {
                    if (!v) {
                        setRejectRequest(null);
                        setRejectNotes('');
                    }
                }}
            >
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Reject Sticker Request</ModalDrawerTitle>
                        <ModalDrawerDescription>The user will be notified of the rejection.</ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <div className="space-y-4 py-2">
                        <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                            <div className="flex flex-col gap-1">
                                <Label className="text-muted-foreground text-xs">Submitted By</Label>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={rejectRequest?.user ?? null} size="sm" />
                                    <div>
                                        <div className="text-sm font-medium">{rejectRequest?.user?.name ?? '—'}</div>
                                        <div className="text-muted-foreground text-xs">{rejectRequest?.user?.email ?? '—'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Vehicle</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-medium">{rejectRequest?.vehicle?.plate_number ?? '—'}</span>
                                        {rejectRequest?.vehicle?.vehicle_type?.name && (
                                            <span className="text-muted-foreground text-xs">· {rejectRequest.vehicle.vehicle_type.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Request Type</Label>
                                    {rejectRequest && <TypeBadge type={rejectRequest.type} />}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reject-notes">
                                Notes <span className="text-muted-foreground text-xs">(optional)</span>
                            </Label>
                            <Textarea
                                id="reject-notes"
                                placeholder="Reason for rejection..."
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <ModalDrawerFooter className="flex-row gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                setRejectRequest(null);
                                setRejectNotes('');
                            }}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={isProcessing}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
