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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Palette } from 'lucide-react';
import { ConfigEmptyState } from './components/ConfigEmptyState';
import { SectionPagination } from './components/SectionPagination';

interface StickerColor {
    id: number;
    name: string;
    hex_code: string;
}

export function StickerColorSection({ stickerColors, pagination }: { stickerColors: StickerColor[]; pagination?: { current_page: number; last_page: number; total: number } }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<StickerColor | null>(null);
    const [form, setForm] = useState({ name: '', hex_code: '#000000' });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewing, setViewing] = useState<StickerColor | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'sticker-colors') {
            setOpen(true);
            sessionStorage.removeItem('openModal');
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.put(route('admin.config.sticker-colors.update', editing.id), form);
        } else {
            router.post(route('admin.config.sticker-colors.store'), form);
        }
        setOpen(false);
        setEditing(null);
        setForm({ name: '', hex_code: '#000000' });
    };

    const handleEdit = (sc: StickerColor) => {
        setEditing(sc);
        setForm({ name: sc.name, hex_code: sc.hex_code });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(route('admin.config.sticker-colors.destroy', deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div>
            <ModalDrawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: '', hex_code: '#000000' }); } }}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>{editing ? 'Edit Sticker Color' : 'Add Sticker Color'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {editing ? 'Update the sticker color details below.' : 'Fill in the sticker color details below.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Hex Code</Label>
                            <div className="flex gap-2">
                                <Input type="color" value={form.hex_code} onChange={(e) => setForm({ ...form, hex_code: e.target.value })} className="w-12 h-10 p-1" />
                                <Input value={form.hex_code} onChange={(e) => setForm({ ...form, hex_code: e.target.value })} className="flex-1 h-10" />
                            </div>
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
                            <TableHead className="font-semibold">Preview</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Hex Code</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stickerColors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <ConfigEmptyState
                                        title="No colors yet"
                                        description="Add a sticker color to get started."
                                        icon={Palette}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            stickerColors.map((sc) => (
                                <TableRow key={sc.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: sc.hex_code }} />
                                    </TableCell>
                                    <TableCell className="font-medium">{sc.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{sc.hex_code}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(sc), 0)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDelete(sc.id)} className="text-destructive">
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
                {stickerColors.length === 0 ? (
                    <ConfigEmptyState
                        title="No colors yet"
                        description="Add a sticker color to get started."
                        icon={Palette}
                    />
                ) : (
                    stickerColors.map((sc) => (
                        <div key={sc.id} className="rounded-lg border bg-card p-4 mb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: sc.hex_code }} />
                                    <div>
                                        <div className="font-medium">{sc.name}</div>
                                        <div className="text-sm text-muted-foreground">{sc.hex_code}</div>
                                    </div>
                                </div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setViewing(sc)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(sc), 0)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setDeleteId(sc.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <SectionPagination pagination={pagination} routeName="admin.config.sticker-colors" />
            <SectionPagination pagination={pagination} routeName="admin.config.sticker-colors" mobile />

            <ModalDrawer open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Sticker Color Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View sticker color information</ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Name</Label>
                            <div className="font-medium">{viewing?.name}</div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-sm">Hex Code</Label>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border" style={{ backgroundColor: viewing?.hex_code }} />
                                <span className="text-sm">{viewing?.hex_code}</span>
                            </div>
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
                        <ModalDrawerTitle>Delete Sticker Color</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this sticker color? This action cannot be undone.
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
