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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserAvatar } from '@/components/user-avatar';
import { UserCombobox } from '@/components/user-combobox';

import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Car, Eye, Loader2, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Vehicle Registry', href: route('shared.vehicles') }];

interface VehicleType {
    id: number;
    name: string;
    has_plate_number: boolean | number;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    vehicle_count: number;
}

interface Vehicle {
    id: number;
    user_id: number;
    vehicle_type_id: number;
    plate_number: string | null;
    sticker_number: string | null;
    qr_code_path: string | null;
    is_active: boolean;
    expires_at: string | null;
    user?: UserData;
    vehicle_type?: VehicleType;
    sticker_color?: { name: string; hex_code: string };
}

interface Props {
    vehicles: Vehicle[];
    vehicleTypes: VehicleType[];
    users: UserData[];
    vehiclesPagination?: { current_page: number; last_page: number; total: number };
}

export default function VehicleIndex({ vehicles, vehicleTypes, users, canManage = false, vehiclesPagination }: Props & { canManage?: boolean }) {
    const [searchQuery, setSearchQuery] = useState('');
    const MAX_VEHICLES = 3;
    // Modal states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null);
    const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm({
        user_id: '',
        vehicle_type_id: '',
        plate_number: '',
    });

    const filteredVehicles = useMemo(() => {
        if (!searchQuery.trim()) return vehicles;
        const q = searchQuery.toLowerCase();
        return vehicles.filter((v) =>
            [v.plate_number ?? '', v.user?.name ?? '', v.sticker_number ?? '', v.vehicle_type?.name ?? ''].join(' ').toLowerCase().includes(q),
        );
    }, [vehicles, searchQuery]);

    const selectedOwner = useMemo(() => users.find((u) => u.id.toString() === form.data.user_id) ?? null, [users, form.data.user_id]);
    const ownerAtLimit = selectedOwner !== null && selectedOwner.vehicle_count >= MAX_VEHICLES;

    const selectedType = useMemo(
        () => vehicleTypes.find((t) => t.id.toString() === form.data.vehicle_type_id),
        [vehicleTypes, form.data.vehicle_type_id],
    );
    const needsPlate = selectedType ? selectedType.has_plate_number === true || selectedType.has_plate_number === 1 : true;

    const handleOpenAdd = () => {
        form.reset();
        form.clearErrors();
        setIsAddOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('shared.vehicles.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
            },
            onError: () => toast.error('Failed to add vehicle. Please check the form.'),
        });
    };

    const handleDelete = () => {
        if (!deleteVehicle) return;
        setIsDeleting(true);
        router.delete(route('shared.vehicles.destroy', deleteVehicle.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteVehicle(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
                toast.error('Failed to delete vehicle');
            },
        });
    };

    const ActionsMenu = ({ vehicle }: { vehicle: Vehicle }) => (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setViewVehicle(vehicle)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                </DropdownMenuItem>
                {canManage && (
                    <DropdownMenuItem onSelect={() => setDeleteVehicle(vehicle)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Registry" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-2xl font-bold tracking-tight">Vehicle Registry</h1>
                        <p className="text-muted-foreground text-sm">Track campus vehicle stickers and license plates.</p>
                    </div>
                    {canManage && (
                        <Button size="sm" className="w-full gap-2 sm:w-auto" onClick={handleOpenAdd}>
                            <Plus className="h-4 w-4" /> Add Vehicle
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="hidden gap-4 md:grid md:grid-cols-4">
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Total Vehicles</span>
                            <span className="text-2xl font-bold">{vehicles.length.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-green-500 uppercase">Active</span>
                            <span className="text-2xl font-bold">
                                {vehicles
                                    .filter((v) => v.is_active)
                                    .length.toString()
                                    .padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">Expired</span>
                            <span className="text-2xl font-bold">
                                {vehicles
                                    .filter((v) => !v.is_active)
                                    .length.toString()
                                    .padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">No Sticker</span>
                            <span className="text-2xl font-bold">
                                {vehicles
                                    .filter((v) => !v.sticker_number)
                                    .length.toString()
                                    .padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search by plate, owner, or sticker..."
                        className="border-border bg-card h-10 pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Desktop Table */}
                <div className="bg-card hidden overflow-x-auto rounded-lg border md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Vehicle</TableHead>
                                <TableHead className="font-semibold">Owner</TableHead>
                                <TableHead className="font-semibold">Sticker</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center">
                                        <Car className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                                        <p className="text-foreground font-medium">No vehicles found</p>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {searchQuery ? 'Try adjusting your search.' : 'No vehicles registered yet.'}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-muted/50 text-muted-foreground rounded-lg p-2">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold tracking-tight uppercase">
                                                        {vehicle.plate_number ?? 'NO PLATE'}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {vehicle.vehicle_type?.name ?? 'Standard Vehicle'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <UserAvatar user={vehicle.user ?? null} size="sm" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{vehicle.user?.name ?? 'Unknown'}</span>
                                                    <span className="text-muted-foreground text-[10px]">{vehicle.user?.role ?? 'N/A'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {vehicle.sticker_color && (
                                                        <div className="bg-muted flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium">
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: vehicle.sticker_color.hex_code }}
                                                            />
                                                            {vehicle.sticker_color.name}
                                                        </div>
                                                    )}
                                                    <span className="font-mono text-sm font-bold">{vehicle.sticker_number ?? 'PENDING'}</span>
                                                </div>
                                                {vehicle.expires_at && (
                                                    <span className="text-muted-foreground text-[10px]">
                                                        Exp: {new Date(vehicle.expires_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn('h-5 px-1.5 text-[10px]', vehicle.is_active ? 'bg-green-500' : 'bg-red-500')}>
                                                {vehicle.is_active ? 'Active' : 'Expired'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ActionsMenu vehicle={vehicle} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden">
                    {filteredVehicles.length === 0 ? (
                        <div className="py-12 text-center">
                            <Car className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
                            <p className="text-foreground font-medium">No vehicles found</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {searchQuery ? 'Try adjusting your search.' : 'No vehicles registered yet.'}
                            </p>
                        </div>
                    ) : (
                        filteredVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-card mb-2 rounded-lg border p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-mono font-bold tracking-tight uppercase">{vehicle.plate_number ?? 'No Plate'}</div>
                                        <div className="text-muted-foreground text-sm">{vehicle.vehicle_type?.name ?? 'Standard Vehicle'}</div>
                                    </div>
                                    <ActionsMenu vehicle={vehicle} />
                                </div>

                                <div className="mt-2 flex items-center gap-1.5">
                                    <UserAvatar user={vehicle.user ?? null} size="xs" />
                                    <span className="text-muted-foreground truncate text-sm">{vehicle.user?.name ?? 'Unknown'}</span>
                                    <span className="text-muted-foreground shrink-0 text-[10px]">• {vehicle.user?.role ?? ''}</span>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {vehicle.sticker_color && (
                                            <div className="bg-muted flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium">
                                                <div
                                                    className="h-1.5 w-1.5 rounded-full"
                                                    style={{ backgroundColor: vehicle.sticker_color.hex_code }}
                                                />
                                                {vehicle.sticker_color.name}
                                            </div>
                                        )}
                                        <span className="text-foreground font-mono text-[11px] font-bold">{vehicle.sticker_number ?? 'PENDING'}</span>
                                    </div>
                                    <Badge className={cn('h-5 px-1.5 text-[10px]', vehicle.is_active ? 'bg-green-500' : 'bg-red-500')}>
                                        {vehicle.is_active ? 'Active' : 'Expired'}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
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

            {/* ── ADD VEHICLE MODAL ─────────────────────────────────────────────── */}
            <ModalDrawer
                open={isAddOpen}
                onOpenChange={(v) => {
                    setIsAddOpen(v);
                    if (!v) {
                        form.reset();
                        form.clearErrors();
                    }
                }}
            >
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Add Vehicle</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Register a vehicle for a campus member. A sticker will be automatically generated.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Vehicle Owner</Label>
                            <UserCombobox
                                users={users}
                                value={form.data.user_id}
                                onChange={(val) => {
                                    form.setData('user_id', val);
                                    form.clearErrors('user_id');
                                }}
                                placeholder="Select owner..."
                                error={form.errors.user_id}
                            />
                            {form.errors.user_id && <p className="text-destructive text-xs">{form.errors.user_id}</p>}
                            {selectedOwner && (
                                <div
                                    className={cn(
                                        'flex items-center justify-between rounded-lg border px-3 py-2 text-xs',
                                        ownerAtLimit
                                            ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                            : 'border-border bg-muted/40 text-muted-foreground',
                                    )}
                                >
                                    <span>
                                        <span className="text-foreground font-semibold">{selectedOwner.name}</span>
                                        {' — '}
                                        {selectedOwner.vehicle_count} / {MAX_VEHICLES} vehicles registered
                                    </span>
                                    {ownerAtLimit && <span className="font-bold tracking-wide uppercase">Limit reached</span>}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vehicle_type">Vehicle Type</Label>
                            <Select
                                value={form.data.vehicle_type_id}
                                onValueChange={(val) => {
                                    const type = vehicleTypes.find((t) => t.id.toString() === val);
                                    const hasPlate = type ? type.has_plate_number === true || type.has_plate_number === 1 : true;
                                    form.setData({
                                        ...form.data,
                                        vehicle_type_id: val,
                                        plate_number: hasPlate ? form.data.plate_number : '',
                                    });
                                }}
                            >
                                <SelectTrigger id="vehicle_type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vehicleTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.vehicle_type_id && <p className="text-destructive text-xs">{form.errors.vehicle_type_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="plate_number">
                                Plate Number {!needsPlate && <span className="text-muted-foreground font-normal">(N/A)</span>}
                            </Label>
                            <Input
                                id="plate_number"
                                placeholder={needsPlate ? 'e.g. ABC 1234' : 'No plate required'}
                                disabled={!needsPlate}
                                value={form.data.plate_number}
                                onChange={(e) => form.setData('plate_number', e.target.value.toUpperCase())}
                            />
                            {form.errors.plate_number && <p className="text-destructive text-xs">{form.errors.plate_number}</p>}
                        </div>

                        <ModalDrawerFooter className="px-0">
                            <Button type="submit" className="w-full" disabled={form.processing || ownerAtLimit}>
                                {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {form.processing ? 'Adding...' : 'Add Vehicle'}
                            </Button>
                        </ModalDrawerFooter>
                    </form>
                </ModalDrawerContent>
            </ModalDrawer>

            {/* ── VIEW VEHICLE MODAL ────────────────────────────────────────────── */}
            <ModalDrawer open={viewVehicle !== null} onOpenChange={(v) => !v && setViewVehicle(null)}>
                <ModalDrawerContent className="flex max-h-[85vh] flex-col !gap-0 overflow-hidden !p-0 !pt-0 sm:max-h-[90vh] sm:max-w-2xl [&>button]:z-50">
                    <ModalDrawerHeader className="bg-background sticky top-0 z-10 mb-0 border-b px-6 pt-0 pb-4 sm:relative sm:pt-6">
                        <ModalDrawerTitle>Vehicle Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View registered vehicle and permit information</ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-6 py-6">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Left: Vehicle & Owner Info */}
                            <div className="space-y-6">
                                <div className="grid gap-1.5">
                                    <Label className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">Plate Number</Label>
                                    <div className="font-mono text-xl font-black tracking-tight uppercase">
                                        {viewVehicle?.plate_number ?? 'NO PLATE'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">Vehicle Type</Label>
                                        <div className="text-sm font-semibold">{viewVehicle?.vehicle_type?.name ?? '—'}</div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">Status</Label>
                                        <div className="mt-0.5">
                                            <Badge
                                                className={cn(
                                                    'h-5 px-1.5 text-[10px] font-bold shadow-sm',
                                                    viewVehicle?.is_active ? 'bg-green-500' : 'bg-red-500',
                                                )}
                                            >
                                                {viewVehicle?.is_active ? 'Active' : 'Expired'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-1.5 border-t pt-4">
                                    <Label className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">Permit Information</Label>
                                    <div className="mt-2 space-y-4">
                                        <div className="grid gap-1">
                                            <p className="text-muted-foreground text-[10px] font-bold uppercase">Sticker Number</p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                {viewVehicle?.sticker_color && (
                                                    <div className="bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-sm">
                                                        <div
                                                            className="h-2 w-2 rounded-full"
                                                            style={{ backgroundColor: viewVehicle.sticker_color.hex_code }}
                                                        />
                                                        {viewVehicle.sticker_color.name}
                                                    </div>
                                                )}
                                                <span className="font-mono text-lg font-black">{viewVehicle?.sticker_number ?? 'PENDING'}</span>
                                            </div>
                                        </div>
                                        <div className="grid gap-1">
                                            <p className="text-muted-foreground text-[10px] font-bold uppercase">Expiry Date</p>
                                            <p className="text-sm font-semibold">
                                                {viewVehicle?.expires_at
                                                    ? new Date(viewVehicle.expires_at).toLocaleDateString('en-US', {
                                                          month: 'long',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      })
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-1.5 border-t pt-4">
                                    <Label className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">Registered Owner</Label>
                                    <div className="bg-muted/30 mt-2 flex items-center gap-3 rounded-xl border border-dashed p-3">
                                        <UserAvatar user={viewVehicle?.user ?? null} size="md" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{viewVehicle?.user?.name ?? '—'}</span>
                                            <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                                                {viewVehicle?.user?.role ?? ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Sticker Preview */}
                            {viewVehicle?.qr_code_path && (
                                <div className="space-y-4">
                                    <Label className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">Generated Sticker</Label>
                                    <div className="bg-card border-muted-foreground/20 group relative aspect-[2/3] w-full overflow-hidden rounded-2xl border-2 border-dashed p-6 shadow-sm">
                                        <img
                                            src={`/stickers/${viewVehicle.user?.id}/${viewVehicle.qr_code_path.split('/').pop()}`}
                                            alt="Vehicle Sticker"
                                            className="h-full w-full object-contain drop-shadow-2xl transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-center text-[10px] font-medium text-white backdrop-blur-md">
                                            OFFICIAL PERMIT
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full gap-2 text-xs shadow-sm"
                                        onClick={() => {
                                            const url = `/stickers/${viewVehicle?.user?.id}/${viewVehicle?.qr_code_path?.split('/').pop()}`;
                                            if (url) window.open(url, '_blank');
                                        }}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        Open Full Size
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <ModalDrawerFooter className="bg-muted/20 mt-0 border-t px-6 py-4">
                        <Button variant="outline" onClick={() => setViewVehicle(null)} className="w-full sm:w-auto">
                            Close
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            {/* ── DELETE VEHICLE MODAL ──────────────────────────────────────────── */}
            <ModalDrawer
                open={deleteVehicle !== null}
                onOpenChange={(v) => {
                    if (!v && !isDeleting) setDeleteVehicle(null);
                }}
            >
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Delete Vehicle</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete{' '}
                            <span className="text-foreground font-semibold">{deleteVehicle?.plate_number ?? 'this vehicle'}</span>? This action cannot
                            be undone.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <ModalDrawerFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setDeleteVehicle(null)} className="flex-1" disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 flex-1 text-white" disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
