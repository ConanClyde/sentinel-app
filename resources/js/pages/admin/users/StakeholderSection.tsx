import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, Mail, Eye } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';
import { UserEmptyState } from './components/UserEmptyState';
import { Link } from '@inertiajs/react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface SectionProps {
    users: any[];
    activeRole: string;
    onView: (user: any) => void;
    onEdit?: (user: any) => void;
    onDelete?: (id: number) => void;
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
    };
    roleSlug: string;
}

export function StakeholderSection({ users, activeRole, onView, onEdit, onDelete, pagination, roleSlug }: SectionProps) {
    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="rounded-lg border bg-card overflow-x-auto hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <UserEmptyState activeRole={activeRole} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: any) => (
                                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={user} size="sm" />
                                            <div className="flex flex-col text-sm">
                                                <span className="font-semibold text-foreground">{user.name}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">{user.role_name || 'General'}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onSelect={() => onView(user)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                                </DropdownMenuItem>
                                                {onEdit && (<DropdownMenuItem onSelect={() => onEdit && onEdit(user)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit Info
                                                </DropdownMenuItem>)}
                                                {onDelete && (<DropdownMenuItem onSelect={() => onDelete && onDelete(user.id)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                                                </DropdownMenuItem>)}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
                {users.length === 0 ? (
                    <UserEmptyState activeRole={activeRole} />
                ) : (
                    users.map((user: any) => (
                        <div key={user.id} className="rounded-xl border bg-card p-4 mb-3 shadow-sm active:bg-muted/50 transition-colors">
                            <div className="flex gap-4">
                                <UserAvatar user={user} size="md" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-foreground truncate">{user.name}</div>
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onSelect={() => onView(user)}>
                                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                                </DropdownMenuItem>
                                                {onEdit && (<DropdownMenuItem onSelect={() => onEdit && onEdit(user)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>)}
                                                {onDelete && (<DropdownMenuItem onSelect={() => onDelete && onDelete(user.id)} className="text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>)}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5 border-b pb-3 mb-3">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold">{user.role_name || 'General'}</span>
                                    </div>
                                    <div className="flex gap-2 pt-3 mt-1">
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0">{user.role}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                {pagination && pagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={route('admin.users.byRole', { role: roleSlug }) + '?page=' + (pagination.current_page - 1)}
                                    />
                                </PaginationItem>
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href={route('admin.users.byRole', { role: roleSlug }) + '?page=' + page}
                                            isActive={pagination.current_page === page}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href={route('admin.users.byRole', { role: roleSlug }) + '?page=' + (pagination.current_page + 1)}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center z-50">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={route('admin.users.byRole', { role: roleSlug }) + '?page=' + (pagination.current_page - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href={route('admin.users.byRole', { role: roleSlug }) + '?page=' + page}
                                        isActive={pagination.current_page === page}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href={route('admin.users.byRole', { role: roleSlug }) + '?page=' + (pagination.current_page + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
