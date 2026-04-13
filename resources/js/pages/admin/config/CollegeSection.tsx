import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, Building2, Eye } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { ConfigEmptyState } from './components/ConfigEmptyState';
import { SectionPagination } from './components/SectionPagination';

interface College {
    id: number;
    code: string;
    name: string;
    description: string | null;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    total: number;
}

export function CollegeSection({ colleges, pagination }: { colleges: College[]; pagination?: PaginationInfo }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<College | null>(null);
    const [form, setForm] = useState({ code: '', name: '', description: '' });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewing, setViewing] = useState<College | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'colleges') {
            setOpen(true);
            sessionStorage.removeItem('openModal');
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.put(route('admin.config.colleges.update', editing.id), form);
        } else {
            router.post(route('admin.config.colleges.store'), form);
        }
        setOpen(false);
        setEditing(null);
        setForm({ code: '', name: '', description: '' });
    };

    const handleEdit = (college: College) => {
        setEditing(college);
        setForm({ code: college.code, name: college.name, description: college.description || '' });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(route('admin.config.colleges.destroy', deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div>
            <ModalDrawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ code: '', name: '', description: '' }); } }}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>{editing ? 'Edit College' : 'Add College'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {editing ? 'Update the college details below.' : 'Fill in the college details below.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
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
                            <TableHead className="font-semibold">Code</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {colleges.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <ConfigEmptyState
                                        title="No colleges yet"
                                        description="Add a college to get started."
                                        icon={Building2}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            colleges.map((college) => (
                                <TableRow key={college.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{college.code}</TableCell>
                                    <TableCell>{college.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{college.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setViewing(college)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(college), 0)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setDeleteId(college.id)} className="text-destructive">
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
                {colleges.length === 0 ? (
                    <ConfigEmptyState
                        title="No colleges yet"
                        description="Add a college to get started."
                        icon={Building2}
                    />
                ) : (
                    colleges.map((college) => (
                        <div key={college.id} className="rounded-lg border bg-card p-4 mb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">{college.name}</div>
                                    <div className="text-sm text-muted-foreground">{college.code}</div>
                                </div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setViewing(college)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(college), 0)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setDeleteId(college.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {college.description && (
                                <div className="text-sm text-muted-foreground mt-2">{college.description}</div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <SectionPagination pagination={pagination} routeName="admin.config.colleges" />
            <SectionPagination pagination={pagination} routeName="admin.config.colleges" mobile />

            <ModalDrawer open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>College Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View college information</ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Code</Label>
                            <div className="font-medium">{viewing?.code}</div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Name</Label>
                            <div className="font-medium">{viewing?.name}</div>
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
                        <ModalDrawerTitle>Delete College</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this college? This action cannot be undone.
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
