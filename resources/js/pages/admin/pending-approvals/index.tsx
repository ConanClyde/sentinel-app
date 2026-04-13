import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyAction, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserAvatar } from '@/components/user-avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Eye, Filter, Mail, Search } from 'lucide-react';
import { useState } from 'react';

interface PendingApproval {
    id: number;
    first_name: string;
    middle_name?: string;
    surname: string;
    name_extension?: string;
    email: string;
    role: string;
    created_at: string;
    role_type?: {
        name: string;
    };
}

interface Props {
    pendingApprovals: PendingApproval[];
    pendingApprovalsPagination?: { current_page: number; last_page: number; total: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pending Approvals',
        href: route('admin.pending-approvals.index'),
    },
];

export default function PendingApprovalsIndex({ pendingApprovals, pendingApprovalsPagination }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const isMobile = useIsMobile();

    const filteredRegistrations = pendingApprovals.filter((reg) => {
        const fullName = `${reg.first_name} ${reg.middle_name || ''} ${reg.surname} ${reg.name_extension || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || reg.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || reg.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const renderMobileCards = () => (
        <div className="flex flex-col gap-3">
            {filteredRegistrations.map((reg) => {
                const middleInitial = reg.middle_name ? `${reg.middle_name.charAt(0).toUpperCase()}. ` : '';
                const displayName = `${reg.first_name} ${middleInitial}${reg.surname}${reg.name_extension ? ` ${reg.name_extension}` : ''}`;
                return (
                    <div key={reg.id} className="bg-card active:bg-muted/50 rounded-xl border p-4 shadow-sm transition-colors">
                        <div className="flex gap-4">
                            <UserAvatar user={{ name: displayName, email: reg.email }} size="md" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="text-foreground truncate font-bold">{displayName}</span>
                                        <span className="text-muted-foreground font-mono text-xs">#REG-{reg.id.toString().padStart(5, '0')}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" asChild>
                                        <Link href={route('admin.pending-approvals.show', { id: reg.id })}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>

                                <div className="text-muted-foreground mt-1 mb-3 flex items-center gap-1.5 border-b pb-3 text-sm">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{reg.email}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="px-2 py-0 text-xs">
                                        {reg.role}
                                    </Badge>
                                    <div className="text-muted-foreground text-xs">{new Date(reg.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Approvals" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                {/* Header Pattern */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
                    <p className="text-muted-foreground text-sm">Review and approve new identity verification requests.</p>
                </div>

                <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="border-border h-10 pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="border-border bg-card h-10 w-full md:w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="text-muted-foreground h-3.5 w-3.5" />
                                        <SelectValue placeholder="All Roles" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="pl-3">
                                        All Roles
                                    </SelectItem>
                                    <SelectItem value="Student" className="pl-3">
                                        Students
                                    </SelectItem>
                                    <SelectItem value="Staff" className="pl-3">
                                        Staff
                                    </SelectItem>
                                    <SelectItem value="Stakeholder" className="pl-3">
                                        Stakeholders
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {filteredRegistrations.length > 0 ? (
                            <>
                                {isMobile ? (
                                    renderMobileCards()
                                ) : (
                                    <div className="bg-card overflow-x-auto rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="font-semibold">Registrant Identity</TableHead>
                                                    <TableHead className="font-semibold">Email</TableHead>
                                                    <TableHead className="font-semibold">Role</TableHead>
                                                    <TableHead className="font-semibold">Submitted Date</TableHead>
                                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRegistrations.map((reg) => {
                                                    const middleInitial = reg.middle_name ? `${reg.middle_name.charAt(0).toUpperCase()}. ` : '';
                                                    const displayName = `${reg.first_name} ${middleInitial}${reg.surname}${reg.name_extension ? ` ${reg.name_extension}` : ''}`;
                                                    return (
                                                        <TableRow key={reg.id} className="hover:bg-muted/50 transition-colors">
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    <UserAvatar user={{ name: displayName, email: reg.email }} size="sm" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-foreground max-w-[180px] truncate font-semibold">
                                                                            {displayName}
                                                                        </span>
                                                                        <span className="text-muted-foreground text-xs">
                                                                            #REG-{reg.id.toString().padStart(5, '0')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground max-w-[200px] truncate text-sm font-medium">
                                                                {reg.email}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {reg.role}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">
                                                                {new Date(reg.created_at).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="sm" asChild className="h-8">
                                                                    <Link href={route('admin.pending-approvals.show', { id: reg.id })}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-muted/10 rounded-lg border p-12">
                                <Empty className="border-0 bg-transparent py-8 shadow-none">
                                    <EmptyMedia variant="icon" className="bg-muted border">
                                        <AlertCircle className="text-muted-foreground/40 h-10 w-10" />
                                    </EmptyMedia>
                                    <EmptyTitle className="mt-4 text-lg font-bold">No matching requests found</EmptyTitle>
                                    <EmptyDescription className="text-sm">
                                        We couldn't find any pending registrations matching your search criteria.
                                    </EmptyDescription>
                                    <EmptyAction>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setRoleFilter('all');
                                            }}
                                        >
                                            Clear All Filters
                                        </Button>
                                    </EmptyAction>
                                </Empty>
                            </div>
                        )}
                    </div>
                </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                {pendingApprovalsPagination && pendingApprovalsPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('admin.pending-approvals.index') + '?page=' + (pendingApprovalsPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: pendingApprovalsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('admin.pending-approvals.index') + '?page=' + page} isActive={pendingApprovalsPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('admin.pending-approvals.index') + '?page=' + (pendingApprovalsPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {pendingApprovalsPagination && pendingApprovalsPagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={route('admin.pending-approvals.index') + '?page=' + (pendingApprovalsPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: pendingApprovalsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('admin.pending-approvals.index') + '?page=' + page} isActive={pendingApprovalsPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('admin.pending-approvals.index') + '?page=' + (pendingApprovalsPagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </AppLayout>
        );
    }
