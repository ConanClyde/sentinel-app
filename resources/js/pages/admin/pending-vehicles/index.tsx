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
import { Car, CheckCircle2, MoreHorizontal, XCircle } from 'lucide-react';
import { useState } from 'react';

interface VehicleType {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface VehicleRequestRow {
    id: number;
    user_id: number;
    vehicle_type_id: number;
    plate_number: string | null;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    created_at: string;
    user?: User;
    vehicle_type?: VehicleType;
}

interface Props {
    requests: VehicleRequestRow[];
    pendingVehiclesPagination?: { current_page: number; last_page: number; total: number };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pending Vehicles', href: route('admin.pending-vehicles.index') }];

const statusStyles: Record<VehicleRequestRow['status'], string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

function StatusBadge({ status }: { status: VehicleRequestRow['status'] }) {
    return (
        <Badge variant="outline" className={cn('capitalize', statusStyles[status])}>
            {status}
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

export default function PendingVehicles({ requests, pendingVehiclesPagination }: Props) {
    const [approveRequest, setApproveRequest] = useState<VehicleRequestRow | null>(null);
    const [rejectRequest, setRejectRequest] = useState<VehicleRequestRow | null>(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = () => {
        if (!approveRequest) return;
        setIsProcessing(true);
        router.post(
            route('admin.pending-vehicles.approve', approveRequest.id),
            {},
            {
                onSuccess: () => {
                    setApproveRequest(null);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleReject = () => {
        if (!rejectRequest) return;
        setIsProcessing(true);
        router.post(
            route('admin.pending-vehicles.reject', rejectRequest.id),
            { notes: rejectNotes },
            {
                onSuccess: () => {
                    setRejectRequest(null);
                    setRejectNotes('');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Vehicles" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Pending Vehicles</h1>
                    <p className="text-muted-foreground text-sm">Review and process vehicle registration requests from campus members.</p>
                </div>

                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                            <Car className="text-muted-foreground h-7 w-7" />
                        </div>
                        <p className="text-base font-medium">No vehicle requests</p>
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
                                        <TableHead className="font-semibold">Submitted</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id} className="hover:bg-muted/50">
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
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{request.vehicle_type?.name ?? '—'}</span>
                                                    <span className="text-muted-foreground text-xs">{request.plate_number ?? 'No plate'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatDate(request.created_at)}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={request.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu modal={false}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
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
                                    {/* Top row: name + role badge + 3-dot menu */}
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
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Vehicle info */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <Car className="text-muted-foreground h-4 w-4 shrink-0" />
                                        <span className="text-sm font-medium">{request.vehicle_type?.name ?? '—'}</span>
                                        {request.plate_number && (
                                            <>
                                                <span className="text-muted-foreground text-sm">·</span>
                                                <span className="text-muted-foreground text-sm">{request.plate_number}</span>
                                            </>
                                        )}
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
                {pendingVehiclesPagination && pendingVehiclesPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('admin.pending-vehicles.index') + '?page=' + (pendingVehiclesPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: pendingVehiclesPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('admin.pending-vehicles.index') + '?page=' + page} isActive={pendingVehiclesPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('admin.pending-vehicles.index') + '?page=' + (pendingVehiclesPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {pendingVehiclesPagination && pendingVehiclesPagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={route('admin.pending-vehicles.index') + '?page=' + (pendingVehiclesPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: pendingVehiclesPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('admin.pending-vehicles.index') + '?page=' + page} isActive={pendingVehiclesPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('admin.pending-vehicles.index') + '?page=' + (pendingVehiclesPagination.current_page + 1)} />
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
                        <ModalDrawerTitle>Approve Vehicle Request</ModalDrawerTitle>
                        <ModalDrawerDescription>A sticker will be automatically generated upon approval.</ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <div className="space-y-4 py-2">
                        <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                            <div className="flex flex-col gap-1">
                                <Label className="text-muted-foreground text-xs">Requested By</Label>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={approveRequest?.user ?? null} size="sm" />
                                    <div>
                                        <div className="text-sm font-medium">{approveRequest?.user?.name ?? '—'}</div>
                                        <div className="text-muted-foreground text-xs">{approveRequest?.user?.email ?? '—'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Vehicle Type</Label>
                                    <div className="text-sm font-medium">{approveRequest?.vehicle_type?.name ?? '—'}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Plate Number</Label>
                                    <div className="text-sm font-medium">{approveRequest?.plate_number ?? 'Not provided'}</div>
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
                            Approve & Generate Sticker
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
                        <ModalDrawerTitle>Reject Vehicle Request</ModalDrawerTitle>
                        <ModalDrawerDescription>The user will be notified.</ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <div className="space-y-4 py-2">
                        <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                            <div className="flex flex-col gap-1">
                                <Label className="text-muted-foreground text-xs">Requested By</Label>
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={rejectRequest?.user ?? null} size="sm" />
                                    <div>
                                        <div className="text-sm font-medium">{rejectRequest?.user?.name ?? '—'}</div>
                                        <div className="text-muted-foreground text-xs">{rejectRequest?.user?.email ?? '—'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Vehicle Type</Label>
                                    <div className="text-sm font-medium">{rejectRequest?.vehicle_type?.name ?? '—'}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-muted-foreground text-xs">Plate Number</Label>
                                    <div className="text-sm font-medium">{rejectRequest?.plate_number ?? 'Not provided'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reject-notes">Reason for Rejection</Label>
                            <Textarea
                                id="reject-notes"
                                placeholder="Reason for rejection (optional)..."
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
