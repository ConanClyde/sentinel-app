import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Building } from 'lucide-react';
import { ConfigEmptyState } from './components/ConfigEmptyState';
import { SectionPagination } from './components/SectionPagination';

interface RoleType {
    id: number;
    main_role: string;
    name: string;
    description: string | null;
    privileges?: any[];
}

import { Checkbox } from '@/components/ui/checkbox';

export function DepartmentSection({ roleTypes, privileges, pagination }: { roleTypes: RoleType[], privileges?: Record<string, any[]>, pagination?: { current_page: number; last_page: number; total: number } }) {
    const departmentTypes = roleTypes.filter(rt => rt.main_role === 'Department');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<RoleType | null>(null);
    const [form, setForm] = useState<{ main_role: string; name: string; description: string; privilege_ids: number[] }>({
        main_role: 'Department', name: '', description: '', privilege_ids: []
    });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewing, setViewing] = useState<RoleType | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'departments') {
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
        setForm({ main_role: 'Department', name: '', description: '', privilege_ids: [] });
    };

    const handleEdit = (rt: RoleType) => {
        setEditing(rt);
        // Robustly extract IDs to ensure checkboxes are checked correctly
        const selectedIds = rt.privileges
            ? rt.privileges.map((p: any) => Number(p.id))
            : [];

        setForm({
            main_role: rt.main_role,
            name: rt.name,
            description: rt.description || '',
            privilege_ids: selectedIds
        });
        setOpen(true);
    };

    const handlePrivilegeToggle = (id: number) => {
        const toggleId = Number(id);

        // Don't toggle if it's locked
        if (editing) {
            const privilege = Object.values(privileges || {}).flat().find(p => Number(p.id) === toggleId);
            if (privilege && isPrivilegeLocked(privilege.name)) {
                return;
            }
        }

        setForm(prev => {
            const currentIds = prev.privilege_ids.map(pid => Number(pid));
            if (currentIds.includes(toggleId)) {
                return { ...prev, privilege_ids: currentIds.filter(pid => pid !== toggleId) };
            } else {
                return { ...prev, privilege_ids: [...currentIds, toggleId] };
            }
        });
    };

    const isPrivilegeLocked = (privName: string) => {
        if (!editing) return false;
        const name = editing.name;
        if (name === 'SAS' || name === 'Office of the Chancellor') {
            return privName === 'manage_reports';
        }
        return false;
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
            <ModalDrawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ main_role: 'Department', name: '', description: '', privilege_ids: [] }); } }}>
                <ModalDrawerContent className="sm:max-w-3xl !p-0 !pt-0 !gap-0 flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-hidden [&>button]:z-50">
                    <ModalDrawerHeader className="px-6 pt-0 sm:pt-6 pb-4 border-b mb-0 bg-background sticky top-0 z-10 sm:relative">
                        <ModalDrawerTitle>{editing ? 'Edit Department' : 'Add Department'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {editing ? 'Update the department details below.' : 'Fill in the department details below.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 space-y-6 pt-4 pb-8 overscroll-contain">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div>
                                    <Label className="text-base font-semibold">Department Privileges</Label>
                                    <p className="text-sm text-muted-foreground mb-4">Select what users in this department can access.</p>
                                </div>
                                <div className="space-y-8">
                                    {privileges && Object.entries(privileges).map(([category, privs]) => (
                                        <div key={category} className="space-y-3 border-t pt-6 first:border-0 first:pt-2">
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{category.replace(/_/g, ' ')}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                                {privs.map((privilege: any) => (
                                                    <div key={privilege.id} className="flex items-start space-x-3 py-1">
                                                        <Checkbox
                                                            id={`priv-${privilege.id}`}
                                                            checked={isPrivilegeLocked(privilege.name) || form.privilege_ids.some(pid => Number(pid) === Number(privilege.id))}
                                                            onCheckedChange={() => handlePrivilegeToggle(privilege.id)}
                                                            disabled={isPrivilegeLocked(privilege.name)}
                                                            className="translate-y-0.5"
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <div className="flex items-center gap-2">
                                                                <label
                                                                    htmlFor={`priv-${privilege.id}`}
                                                                    className={cn(
                                                                        "text-sm font-medium leading-none cursor-pointer transition-colors",
                                                                        isPrivilegeLocked(privilege.name) && "text-primary font-bold"
                                                                    )}
                                                                >
                                                                    {privilege.label}
                                                                </label>
                                                                {isPrivilegeLocked(privilege.name) && (
                                                                    <div className="px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary tracking-tighter">
                                                                        Mandatory
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {privilege.description && (
                                                                <p className="text-[11px] text-muted-foreground leading-snug">
                                                                    {privilege.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <ModalDrawerFooter className="px-6 py-4 border-t bg-muted/20 mt-0">
                            <Button type="submit" className="w-full sm:w-auto ml-auto">{editing ? 'Update Department' : 'Create Department'}</Button>
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
                        {departmentTypes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <ConfigEmptyState
                                        title="No departments yet"
                                        description="Add a department to get started."
                                        icon={Building}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            departmentTypes.map((dept) => (
                                <TableRow key={dept.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{dept.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setViewing(dept)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(dept), 0)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setDeleteId(dept.id)} className="text-destructive">
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
                {departmentTypes.length === 0 ? (
                    <Empty>
                        <EmptyTitle>No departments yet</EmptyTitle>
                        <EmptyDescription>Add a department to get started.</EmptyDescription>
                    </Empty>
                ) : (
                    departmentTypes.map((dept) => (
                        <div key={dept.id} className="rounded-lg border bg-card p-4 mb-2">
                            <div className="flex justify-between items-start">
                                <div className="font-medium">{dept.name}</div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setViewing(dept)}>
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(dept), 0)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setDeleteId(dept.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {dept.description && <div className="text-sm text-muted-foreground mt-2">{dept.description}</div>}
                        </div>
                    ))
                )}
            </div>

            <SectionPagination pagination={pagination} routeName="admin.config.departments" />
            <SectionPagination pagination={pagination} routeName="admin.config.departments" mobile />

            <ModalDrawer open={viewing !== null} onOpenChange={(v) => !v && setViewing(null)}>
                <ModalDrawerContent className="sm:max-w-xl !p-0 !pt-0 !gap-0 flex flex-col max-h-[80vh] sm:max-h-[90vh] overflow-hidden [&>button]:z-50">
                    <ModalDrawerHeader className="px-6 pt-0 sm:pt-6 pb-4 border-b mb-0 bg-background sticky top-0 z-10 sm:relative">
                        <ModalDrawerTitle>Department Details</ModalDrawerTitle>
                        <ModalDrawerDescription>View department information</ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-[11px] uppercase tracking-wider font-bold">Name</Label>
                            <div className="text-base font-medium">{viewing?.name}</div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-muted-foreground text-[11px] uppercase tracking-wider font-bold">Description</Label>
                            <div className="text-sm leading-relaxed">{viewing?.description || 'No description provided.'}</div>
                        </div>
                        <div className="grid gap-1.5 pt-4 border-t">
                            <Label className="text-muted-foreground text-[11px] uppercase tracking-wider font-bold mb-2">Assigned Privileges</Label>
                            {viewing?.privileges && viewing.privileges.length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(
                                        viewing.privileges.reduce((acc: any, p: any) => {
                                            const cat = p.category || 'Other';
                                            if (!acc[cat]) acc[cat] = [];
                                            acc[cat].push(p);
                                            return acc;
                                        }, {})
                                    ).map(([category, privs]: [string, any]) => (
                                        <div key={category} className="space-y-2">
                                            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                {category.replace(/_/g, ' ')}
                                            </h5>
                                            <div className="flex flex-wrap gap-1.5">
                                                {privs.map((p: any) => (
                                                    <div
                                                        key={p.id}
                                                        className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold rounded-md shadow-sm"
                                                    >
                                                        {p.description || p.name.replace(/_/g, ' ')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed">
                                    No specific privileges have been assigned to this department yet.
                                </div>
                            )}
                        </div>
                    </div>
                    <ModalDrawerFooter className="px-6 py-4 border-t bg-muted/20 mt-0">
                        <Button variant="outline" onClick={() => setViewing(null)} className="w-full sm:w-auto">Close</Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            <ModalDrawer open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Delete Department</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this department? This action cannot be undone.
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
