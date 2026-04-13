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
import { MoreHorizontal, GraduationCap } from 'lucide-react';
import { ConfigEmptyState } from './components/ConfigEmptyState';

interface College {
    id: number;
    name: string;
}

interface Program {
    id: number;
    college_id: number;
    code: string;
    name: string;
    description: string | null;
    college?: College;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    total: number;
}

export function ProgramSection({ programs, colleges, pagination }: { programs: Program[]; colleges: College[]; pagination?: PaginationInfo }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Program | null>(null);
    const [form, setForm] = useState({ college_id: '', code: '', name: '', description: '' });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewing, setViewing] = useState<Program | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'programs') {
            setOpen(true);
            sessionStorage.removeItem('openModal');
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form, college_id: Number(form.college_id) };
        if (editing) {
            router.put(route('admin.config.programs.update', editing.id), data);
        } else {
            router.post(route('admin.config.programs.store'), data);
        }
        setOpen(false);
        setEditing(null);
        setForm({ college_id: '', code: '', name: '', description: '' });
    };

    const handleEdit = (program: Program) => {
        setEditing(program);
        setForm({ college_id: String(program.college_id), code: program.code, name: program.name, description: program.description || '' });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(route('admin.config.programs.destroy', deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div>
            <ModalDrawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ college_id: '', code: '', name: '', description: '' }); } }}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>{editing ? 'Edit Program' : 'Add Program'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {editing ? 'Update the program details below.' : 'Fill in the program details below.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>College</Label>
                            <Select value={form.college_id} onValueChange={(v) => setForm({ ...form, college_id: v })}>
                                <SelectTrigger className="h-10"><SelectValue placeholder="Select college" /></SelectTrigger>
                                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                    {colleges.map((c) => (<SelectItem key={c.id} value={String(c.id)} className="pl-3">{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
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
                            <TableHead className="font-semibold">College</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {programs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <ConfigEmptyState
                                        title="No programs yet"
                                        description="Add a program to get started."
                                        icon={GraduationCap}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            programs.map((program) => (
                                <TableRow key={program.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{program.code}</TableCell>
                                    <TableCell>{program.name}</TableCell>
                                    <TableCell>{program.college?.name || '-'}</TableCell>
                                    <TableCell className="text-muted-foreground">{program.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setViewing(program)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(program), 0)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setDeleteId(program.id)} className="text-destructive">
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
                {programs.length === 0 ? (
                    <ConfigEmptyState
                        title="No programs yet"
                        description="Add a program to get started."
                        icon={GraduationCap}
                    />
                ) : (
                    programs.map((program) => (
                        <div key={program.id} className="rounded-lg border bg-card p-4 mb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">{program.name}</div>
                                    <div className="text-sm text-muted-foreground">{program.code}</div>
                                </div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setViewing(program)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(program), 0)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setDeleteId(program.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">{program.college?.name || '-'}</div>
                            {program.description && (
                                <div className="text-sm text-muted-foreground mt-1">{program.description}</div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="hidden md:block">
                {pagination && pagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={route('admin.config.programs') + '?page=' + (pagination.current_page - 1)}
                                    />
                                </PaginationItem>
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href={route('admin.config.programs') + '?page=' + page}
                                            isActive={pagination.current_page === page}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href={route('admin.config.programs') + '?page=' + (pagination.current_page + 1)}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={route('admin.config.programs') + '?page=' + (pagination.current_page - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href={route('admin.config.programs') + '?page=' + page}
                                        isActive={pagination.current_page === page}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href={route('admin.config.programs') + '?page=' + (pagination.current_page + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <ModalDrawer open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Program Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View program information</ModalDrawerDescription>
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
                            <Label className="text-muted-foreground text-sm">College</Label>
                            <div className="text-sm">{viewing?.college?.name || '-'}</div>
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

            <ModalDrawer open={deleteId !== null && window.innerWidth < 768} onOpenChange={(v) => !v && setDeleteId(null)}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Delete Program</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this program? This action cannot be undone.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <ModalDrawerFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="w-full">Cancel</Button>
                        <Button onClick={confirmDelete} className="w-full bg-destructive hover:bg-destructive/90 text-white">Delete</Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            <AlertDialog open={deleteId !== null && window.innerWidth >= 768} onOpenChange={(v) => !v && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Program</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this program? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
