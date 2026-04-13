import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
} from '@/components/modal-drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Car } from 'lucide-react';
import { ConfigEmptyState } from './components/ConfigEmptyState';
import { SectionPagination } from './components/SectionPagination';

interface VehicleType {
    id: number;
    name: string;
    description: string | null;
    has_plate_number: boolean;
}

export function VehicleTypeSection({ vehicleTypes, pagination }: { vehicleTypes: VehicleType[]; pagination?: { current_page: number; last_page: number; total: number } }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<VehicleType | null>(null);
    const [form, setForm] = useState({ name: '', description: '', has_plate_number: true });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewing, setViewing] = useState<VehicleType | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'vehicle-types') {
            setOpen(true);
            sessionStorage.removeItem('openModal');
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.put(route('admin.config.vehicle-types.update', editing.id), form);
        } else {
            router.post(route('admin.config.vehicle-types.store'), form);
        }
        setOpen(false);
        setEditing(null);
        setForm({ name: '', description: '', has_plate_number: true });
    };

    const handleEdit = (vt: VehicleType) => {
        setEditing(vt);
        setForm({ name: vt.name, description: vt.description || '', has_plate_number: vt.has_plate_number });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(route('admin.config.vehicle-types.destroy', deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div>
            <ModalDrawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: '', description: '', has_plate_number: false }); } }}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>{editing ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {editing ? 'Update the vehicle type details below.' : 'Fill in the vehicle type details below.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <Checkbox id="has_plate_number" checked={form.has_plate_number} onCheckedChange={(v) => setForm({ ...form, has_plate_number: !!v })} />
                            <Label htmlFor="has_plate_number">Requires Plate Number</Label>
                        </div>
                        <ModalDrawerFooter className="px-0">
                            <Button type="submit" className="w-full">{editing ? 'Update' : 'Create'}</Button>
                        </ModalDrawerFooter>
                    </form>
                </ModalDrawerContent>
            </ModalDrawer>

            <div className="rounded-lg border bg-card overflow-x-auto hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="font-semibold">Has Plate Number</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vehicleTypes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <ConfigEmptyState
                                        title="No vehicle types yet"
                                        description="Add a vehicle type to get started."
                                        icon={Car}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicleTypes.map((vt) => (
                                <TableRow key={vt.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{vt.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{vt.description || '-'}</TableCell>
                                    <TableCell>
                                        {vt.has_plate_number ? (
                                            <Badge variant="success">Yes</Badge>
                                        ) : (
                                            <Badge variant="secondary">No</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setViewing(vt)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(vt), 0)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setDeleteId(vt.id)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="md:hidden">
                {vehicleTypes.length === 0 ? (
                    <ConfigEmptyState
                        title="No vehicle types yet"
                        description="Add a vehicle type to get started."
                        icon={Car}
                    />
                ) : (
                    vehicleTypes.map((vt) => (
                        <div key={vt.id} className="rounded-lg border bg-card p-4 mb-2">
                            <div className="flex justify-between items-start">
                                <div className="font-medium">{vt.name}</div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setViewing(vt)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(vt), 0)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setDeleteId(vt.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">Plate Number: {vt.has_plate_number ? 'Yes' : 'No'}</div>
                            {vt.description && <div className="text-sm text-muted-foreground mt-1">{vt.description}</div>}
                        </div>
                    ))
                )}
            </div>

            <SectionPagination pagination={pagination} routeName="admin.config.vehicle-types" />
            <SectionPagination pagination={pagination} routeName="admin.config.vehicle-types" mobile />

            <ModalDrawer open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Vehicle Type Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View vehicle type information</ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Name</Label>
                            <div className="font-medium">{viewing?.name}</div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Has Plate Number</Label>
                            <div className="text-sm">{viewing?.has_plate_number ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Description</Label>
                            <div className="text-sm">{viewing?.description || '-'}</div>
                        </div>
                    </div>
                    <ModalDrawerFooter>
                        <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            <ModalDrawer open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Delete Vehicle Type</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this vehicle type? This action cannot be undone.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <ModalDrawerFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
                        <Button onClick={confirmDelete} className="flex-1 bg-destructive hover:bg-destructive/90 text-white">Delete</Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </div>
    );
}
