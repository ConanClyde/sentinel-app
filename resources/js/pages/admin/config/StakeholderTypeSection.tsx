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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users } from 'lucide-react';
import { ConfigEmptyState } from './components/ConfigEmptyState';
import { SectionPagination } from './components/SectionPagination';

interface RoleType {
    id: number;
    main_role: string;
    name: string;
    description: string | null;
}

export function StakeholderTypeSection({ roleTypes, pagination }: { roleTypes: RoleType[]; pagination?: { current_page: number; last_page: number; total: number } }) {
    const stakeholderTypes = roleTypes.filter(rt => rt.main_role === 'Stakeholder');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<RoleType | null>(null);
    const [form, setForm] = useState({ main_role: 'Stakeholder', name: '', description: '' });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewing, setViewing] = useState<RoleType | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'stakeholder-types') {
            setOpen(true);
            sessionStorage.removeItem('openModal');
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.put(route('admin.config.role-types.update', editing.id), form);
        } else {
            router.post(route('admin.config.role-types.store'), form);
        }
        setOpen(false);
        setEditing(null);
        setForm({ main_role: 'Stakeholder', name: '', description: '' });
    };

    const handleEdit = (rt: RoleType) => {
        setEditing(rt);
        setForm({ main_role: rt.main_role, name: rt.name, description: rt.description || '' });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(route('admin.config.role-types.destroy', deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div>
            <ModalDrawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ main_role: 'Stakeholder', name: '', description: '' }); } }}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>{editing ? 'Edit Stakeholder Type' : 'Add Stakeholder Type'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {editing ? 'Update the stakeholder type details below.' : 'Fill in the stakeholder type details below.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Main Role</Label>
                            <Select value={form.main_role} onValueChange={(v) => setForm({ ...form, main_role: v })}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                    <SelectItem value="Student" className="pl-3">Student</SelectItem>
                                    <SelectItem value="Staff" className="pl-3">Staff</SelectItem>
                                    <SelectItem value="Stakeholder" className="pl-3">Stakeholder</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stakeholderTypes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <ConfigEmptyState
                                        title="No stakeholder types yet"
                                        description="Add a type to get started."
                                        icon={Users}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            stakeholderTypes.map((rt) => (
                                <TableRow key={rt.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{rt.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{rt.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(rt), 0)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDelete(rt.id)} className="text-destructive">
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
                {stakeholderTypes.length === 0 ? (
                    <Empty>
                        <EmptyTitle>No stakeholder types yet</EmptyTitle>
                        <EmptyDescription>Add a stakeholder type to get started.</EmptyDescription>
                    </Empty>
                ) : (
                    stakeholderTypes.map((rt) => (
                        <div key={rt.id} className="rounded-lg border bg-card p-4 mb-2">
                            <div className="flex justify-between items-start">
                                <div className="font-medium">{rt.name}</div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setViewing(rt)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(rt), 0)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setDeleteId(rt.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {rt.description && <div className="text-sm text-muted-foreground mt-2">{rt.description}</div>}
                        </div>
                    ))
                )}
            </div>

            <SectionPagination pagination={pagination} routeName="admin.config.stakeholder-types" />
            <SectionPagination pagination={pagination} routeName="admin.config.stakeholder-types" mobile />

            <ModalDrawer open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Stakeholder Type Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View stakeholder type information</ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Name</Label>
                            <div className="font-medium">{viewing?.name}</div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Main Role</Label>
                            <div className="text-sm">{viewing?.main_role}</div>
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
                        <ModalDrawerTitle>Delete Stakeholder Type</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this stakeholder type? This action cannot be undone.
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
