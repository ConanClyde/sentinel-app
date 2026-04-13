import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { cn } from '@/lib/utils';
import { AlertCircle, Calendar, Car, Eye, MoreHorizontal, PlusCircle, Search, Tag } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehicleType {
    id: number;
    name: string;
    has_plate_number: boolean | number;
}

interface VehicleRequest {
    id: number;
    vehicle_type_id: number;
    plate_number: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    vehicle_type?: { name: string };
}

interface Vehicle {
    id: number;
    plate_number: string | null;
    sticker_number: string | null;
    is_active: boolean;
    expires_at: string | null;
    vehicle_type?: { name: string };
    sticker_color?: { name: string; hex_code: string };
}

interface Props {
    vehicles: Vehicle[];
    vehicleTypes: VehicleType[];
    pendingRequests: VehicleRequest[];
    vehiclesPagination?: { current_page: number; last_page: number; total: number };
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Registry', href: route('shared.vehicles') },
    { title: 'Vehicles', href: route('shared.vehicles') },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isExpired = (vehicle: Vehicle): boolean => {
    if (!vehicle.is_active) return true;
    if (vehicle.expires_at && new Date(vehicle.expires_at) < new Date()) return true;
    return false;
};

const formatExpiry = (expires_at: string | null): string => {
    if (!expires_at) return '—';
    return new Date(expires_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatSubmitted = (created_at: string): string =>
    new Date(created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

// ─── Sub-components ───────────────────────────────────────────────────────────

function StickerBadge({ vehicle }: { vehicle: Vehicle }) {
    if (vehicle.sticker_number) {
        return (
            <div className="bg-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-bold tracking-tight uppercase">
                {vehicle.sticker_color && (
                    <div
                        className="h-2 w-2 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: vehicle.sticker_color.hex_code }}
                    />
                )}
                {vehicle.sticker_number}
            </div>
        );
    }
    return <span className="text-muted-foreground text-xs italic">Pending</span>;
}

function StatusBadge({ vehicle }: { vehicle: Vehicle }) {
    const expired = isExpired(vehicle);
    return (
        <Badge className={cn('h-5 px-2 text-[9px] font-black uppercase', expired ? 'bg-red-500' : 'bg-green-500')}>
            {expired ? 'Expired' : 'Active'}
        </Badge>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyVehicles({ vehicles, vehicleTypes, pendingRequests, vehiclesPagination }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
    const [addOpen, setAddOpen] = useState(false);

    // ── Add Vehicle form ─────────────────────────────────────────────────────
    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_type_id: '',
        plate_number: '',
    });

    const selectedType = vehicleTypes.find((t) => String(t.id) === data.vehicle_type_id);
    const needsPlate = selectedType ? Boolean(selectedType.has_plate_number) : false;

    const totalCount = vehicles.length + pendingRequests.length;
    const atLimit = totalCount >= 3;

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('shared.vehicle-requests.store'), {
            onSuccess: () => {
                setAddOpen(false);
                reset();
            },
        });
    };

    const handleAddOpenChange = (open: boolean) => {
        setAddOpen(open);
        if (!open) reset();
    };

    // ── Filter ───────────────────────────────────────────────────────────────
    const filteredVehicles = vehicles.filter((v) => {
        const str = ((v.plate_number ?? '') + ' ' + (v.sticker_number ?? '')).toLowerCase();
        return str.includes(searchQuery.toLowerCase());
    });

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Registry" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-2xl font-bold tracking-tight">Authorized Vehicles</h1>
                        <p className="text-muted-foreground text-sm">Manage your registered campus transport units and stickers.</p>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" className="w-full gap-2 sm:w-auto" disabled={atLimit} onClick={() => setAddOpen(true)}>
                            <PlusCircle className="h-4 w-4" />
                            Add Vehicle
                        </Button>
                    </div>
                </div>

                {/* ── At-limit warning ────────────────────────────────────── */}
                {atLimit && (
                    <div className="flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-black tracking-widest text-amber-500 uppercase">Vehicle Limit Reached</p>
                            <p className="text-muted-foreground text-[11px] leading-relaxed">
                                You have reached the maximum of 3 vehicles (registered + pending). Remove an existing vehicle or wait for a pending
                                request to be processed before adding another.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Search ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search by plate or sticker number…"
                            className="border-border bg-card h-10 pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── Desktop Table ────────────────────────────────────────── */}
                <div className="hidden w-full md:block">
                    {filteredVehicles.length > 0 ? (
                        <div className="bg-card overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Vehicle Details</TableHead>
                                        <TableHead className="font-semibold">Sticker Number</TableHead>
                                        <TableHead className="font-semibold">Expiry Date</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVehicles.map((vehicle) => (
                                        <TableRow key={vehicle.id} className="hover:bg-muted/50 transition-colors">
                                            {/* Vehicle Details */}
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted/50 text-muted-foreground rounded-lg p-2">
                                                        <Car className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-foreground font-mono font-bold tracking-tight uppercase">
                                                            {vehicle.plate_number ?? '—'}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {vehicle.vehicle_type?.name ?? 'Standard Vehicle'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Sticker Number */}
                                            <TableCell>
                                                <StickerBadge vehicle={vehicle} />
                                            </TableCell>

                                            {/* Expiry Date */}
                                            <TableCell className="text-muted-foreground text-sm font-medium">
                                                {formatExpiry(vehicle.expires_at)}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <StatusBadge vehicle={vehicle} />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <DropdownMenu modal={false}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem onSelect={() => setViewingVehicle(vehicle)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <Card className="bg-muted/5 flex min-h-[400px] flex-col items-center justify-center border-dashed p-20 text-center">
                            <div className="bg-muted/20 mb-6 rounded-full p-6">
                                <Car className="text-muted-foreground/30 h-12 w-12" />
                            </div>
                            <CardTitle className="mb-2 text-xl font-bold tracking-widest uppercase">Registry Empty</CardTitle>
                            <CardDescription className="mx-auto mb-8 max-w-xs">No vehicles have been registered to your profile yet.</CardDescription>
                            <Button
                                className="h-12 gap-2 rounded-xl px-8 text-xs font-black tracking-widest uppercase"
                                disabled={atLimit}
                                onClick={() => setAddOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4" />
                                Register First Vehicle
                            </Button>
                        </Card>
                    )}
                </div>

                {/* ── Mobile Cards ─────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 md:hidden">
                    {filteredVehicles.length === 0 ? (
                        <Card className="bg-muted/5 flex flex-col items-center justify-center border-dashed p-16 text-center">
                            <div className="bg-muted/20 mb-4 rounded-full p-5">
                                <Car className="text-muted-foreground/30 h-10 w-10" />
                            </div>
                            <CardTitle className="mb-2 text-lg font-bold tracking-widest uppercase">Registry Empty</CardTitle>
                            <CardDescription className="mx-auto mb-6 max-w-xs">No vehicles have been registered to your profile yet.</CardDescription>
                            <Button
                                className="h-11 gap-2 rounded-xl px-6 text-xs font-black tracking-widest uppercase"
                                disabled={atLimit}
                                onClick={() => setAddOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4" />
                                Register First Vehicle
                            </Button>
                        </Card>
                    ) : (
                        filteredVehicles.map((vehicle) => {
                            const expired = isExpired(vehicle);
                            return (
                                <Card
                                    key={vehicle.id}
                                    className="border-muted/40 group hover:border-primary/40 bg-card/50 relative overflow-hidden backdrop-blur-sm transition-all duration-300"
                                >
                                    {/* Status strip */}
                                    <div className={cn('absolute top-0 right-0 left-0 h-1', expired ? 'bg-red-500' : 'bg-green-500')} />

                                    <CardHeader className="pb-4">
                                        <div className="mb-2 flex items-start justify-between">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'border-none px-2 py-0 text-[9px] font-black tracking-tighter uppercase',
                                                    expired ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500',
                                                )}
                                            >
                                                {expired ? 'EXPIRED' : 'ACTIVE'}
                                            </Badge>
                                            <span className="text-muted-foreground font-mono text-[10px] uppercase">
                                                REF NO: VN-{vehicle.id.toString().padStart(4, '0')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted/40 text-muted-foreground group-hover:text-primary rounded-2xl p-3 transition-colors">
                                                <Car className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black tracking-tighter uppercase">
                                                    {vehicle.plate_number ?? '—'}
                                                </CardTitle>
                                                <CardDescription className="text-xs font-bold tracking-widest uppercase">
                                                    {vehicle.vehicle_type?.name ?? 'Standard Vehicle'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase">
                                                    <Tag className="h-3 w-3" />
                                                    Sticker Num
                                                </span>
                                                <div className="mt-0.5">
                                                    <StickerBadge vehicle={vehicle} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 text-right">
                                                <span className="text-muted-foreground flex items-center justify-end gap-1.5 text-[10px] font-black tracking-widest uppercase">
                                                    <Calendar className="h-3 w-3" />
                                                    Expiry Date
                                                </span>
                                                <p className="text-foreground font-mono text-sm font-bold tracking-tight">
                                                    {formatExpiry(vehicle.expires_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            className="border-muted/60 h-10 flex-1 justify-center gap-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase"
                                            onClick={() => setViewingVehicle(vehicle)}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Desktop Pagination */}
                <div className="hidden md:block">
                    {vehiclesPagination && vehiclesPagination.last_page > 1 && (
                        <div className="py-4 ml-auto w-fit">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href={route('shared.vehicles') + '?page=' + (vehiclesPagination.current_page - 1)} />
                                    </PaginationItem>
                                    {Array.from({ length: vehiclesPagination.last_page }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink href={route('shared.vehicles') + '?page=' + page} isActive={vehiclesPagination.current_page === page}>
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext href={route('shared.vehicles') + '?page=' + (vehiclesPagination.current_page + 1)} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>

                {/* Mobile Pagination */}
                {vehiclesPagination && vehiclesPagination.last_page > 1 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('shared.vehicles') + '?page=' + (vehiclesPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: vehiclesPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('shared.vehicles') + '?page=' + page} isActive={vehiclesPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('shared.vehicles') + '?page=' + (vehiclesPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* ── Pending Requests Section ─────────────────────────────── */}
                {pendingRequests.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-foreground text-base font-bold tracking-tight">Pending Requests</h2>
                            <p className="text-muted-foreground text-xs">These requests are awaiting admin review and approval.</p>
                        </div>

                        {/* Desktop */}
                        <div className="bg-card hidden overflow-x-auto rounded-lg border md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Vehicle Type</TableHead>
                                        <TableHead className="font-semibold">Plate Number</TableHead>
                                        <TableHead className="font-semibold">Submitted</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingRequests.map((req) => (
                                        <TableRow key={req.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">{req.vehicle_type?.name ?? '—'}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {req.plate_number ?? <span className="text-muted-foreground text-xs italic">None</span>}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatSubmitted(req.created_at)}</TableCell>
                                            <TableCell>
                                                <Badge className="h-5 bg-amber-500 px-2 text-[9px] font-black uppercase">Pending</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile */}
                        <div className="flex flex-col gap-2 md:hidden">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="bg-card flex items-center justify-between gap-3 rounded-lg border p-4">
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="truncate text-sm font-semibold">{req.vehicle_type?.name ?? '—'}</span>
                                        <span className="text-muted-foreground font-mono text-xs">{req.plate_number ?? 'No plate'}</span>
                                        <span className="text-muted-foreground text-[10px]">Submitted {formatSubmitted(req.created_at)}</span>
                                    </div>
                                    <Badge className="h-5 shrink-0 bg-amber-500 px-2 text-[9px] font-black uppercase">Pending</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── View Vehicle Modal ────────────────────────────────────────── */}
            <ModalDrawer
                open={viewingVehicle !== null}
                onOpenChange={(v) => {
                    if (!v) setViewingVehicle(null);
                }}
            >
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Vehicle Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View your registered vehicle information.</ModalDrawerDescription>
                    </ModalDrawerHeader>

                    {viewingVehicle && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-sm">Plate Number</Label>
                                <div className="font-mono text-2xl font-bold tracking-tight uppercase">{viewingVehicle.plate_number ?? '—'}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-sm">Vehicle Type</Label>
                                <div className="font-medium">{viewingVehicle.vehicle_type?.name ?? 'Standard Vehicle'}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-sm">Sticker Number</Label>
                                <div>
                                    <StickerBadge vehicle={viewingVehicle} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-sm">Expiry Date</Label>
                                <div className="font-medium">{formatExpiry(viewingVehicle.expires_at)}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-sm">Status</Label>
                                <div>
                                    <StatusBadge vehicle={viewingVehicle} />
                                </div>
                            </div>
                        </div>
                    )}

                    <ModalDrawerFooter>
                        <Button variant="outline" onClick={() => setViewingVehicle(null)}>
                            Close
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            {/* ── Add Vehicle Modal ─────────────────────────────────────────── */}
            <ModalDrawer open={addOpen} onOpenChange={handleAddOpenChange}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Add Vehicle</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Submit a request to register a new vehicle. An admin will review and approve it.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        {/* Vehicle Type */}
                        <div className="space-y-2">
                            <Label htmlFor="vehicle_type_id">Vehicle Type</Label>
                            <Select
                                value={data.vehicle_type_id}
                                onValueChange={(v) => {
                                    setData('vehicle_type_id', v);
                                    setData('plate_number', '');
                                }}
                            >
                                <SelectTrigger id="vehicle_type_id">
                                    <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicleTypes.map((type) => (
                                        <SelectItem key={type.id} value={String(type.id)}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.vehicle_type_id && <p className="text-destructive text-xs">{errors.vehicle_type_id}</p>}
                        </div>

                        {/* Plate Number — only when type requires it */}
                        {needsPlate && (
                            <div className="space-y-2">
                                <Label htmlFor="plate_number">Plate Number</Label>
                                <Input
                                    id="plate_number"
                                    placeholder="e.g. ABC 1234"
                                    value={data.plate_number}
                                    onChange={(e) => setData('plate_number', e.target.value)}
                                    required
                                />
                                {errors.plate_number && <p className="text-destructive text-xs">{errors.plate_number}</p>}
                            </div>
                        )}

                        {/* Pending notice */}
                        <div className="bg-muted/50 border-border text-muted-foreground flex items-start gap-3 rounded-lg border p-3 text-xs">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>After submission, your request will be reviewed by an admin before the vehicle is added to your registry.</span>
                        </div>

                        <ModalDrawerFooter className="px-0">
                            <Button type="submit" className="w-full" disabled={processing || !data.vehicle_type_id}>
                                {processing ? 'Submitting…' : 'Submit Request'}
                            </Button>
                        </ModalDrawerFooter>
                    </form>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
