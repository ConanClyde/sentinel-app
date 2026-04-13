import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserAvatar } from '@/components/user-avatar';
import { Eye, Mail, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { UserEmptyState } from './components/UserEmptyState';

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

export function ReporterSection({ users, activeRole, onView, onEdit, onDelete, pagination, roleSlug }: SectionProps) {
    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="bg-card hidden overflow-x-auto rounded-lg border md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Reporter Type</TableHead>
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
                                                <span className="text-foreground font-semibold">{user.name}</span>
                                                <span className="text-muted-foreground max-w-[180px] truncate text-xs">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">{user.role_type?.name || '—'}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onSelect={() => onView(user)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                {onEdit && (<DropdownMenuItem onSelect={() => onEdit && onEdit(user)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Permissions
                                                </DropdownMenuItem>)}
                                                <DropdownMenuItem onSelect={() => onDelete && onDelete(user.id)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Remove Access
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

            {/* Mobile Cards */}
            <div className="md:hidden">
                {users.length === 0 ? (
                    <UserEmptyState activeRole={activeRole} />
                ) : (
                    users.map((user: any) => (
                        <div key={user.id} className="bg-card active:bg-muted/50 mb-3 rounded-xl border p-4 shadow-sm transition-colors">
                            <div className="flex gap-4">
                                <UserAvatar user={user} size="md" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="text-foreground truncate font-bold">{user.name}</div>
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onSelect={() => onView(user)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                {onEdit && (<DropdownMenuItem onSelect={() => onEdit && onEdit(user)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>)}
                                                {onDelete && (<DropdownMenuItem onSelect={() => onDelete && onDelete(user.id)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>)}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="text-muted-foreground mt-0.5 mb-3 flex items-center gap-1.5 border-b pb-3 text-sm">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold">{user.role_type?.name || '—'}</span>
                                    </div>
                                    <div className="mt-1 flex gap-2 pt-3">
                                        <Badge variant="secondary" className="px-2 py-0 text-[10px]">
                                            {user.role}
                                        </Badge>
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
                    <div className="ml-auto w-fit py-4">
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
                <div className="bg-background fixed right-0 bottom-0 left-0 z-50 flex justify-center border-x border-t p-4 md:hidden">
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
                                <PaginationNext href={route('admin.users.byRole', { role: roleSlug }) + '?page=' + (pagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
