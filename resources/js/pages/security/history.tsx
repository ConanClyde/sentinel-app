import { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Clock, MapPin, ChevronRight, ChevronLeft, Search, FileSearch, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface PatrolLog {
    id: number;
    security_user_id: number;
    map_location_id: number;
    checked_in_at: string;
    notes: string | null;
    location: {
        id: number;
        name: string;
        short_code: string;
    };
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'My Patrol History', href: route('security.history') },
];

export default function PatrolHistory() {
    const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationData>({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPatrolHistory = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('api.patrol.history'), {
                    params: { page: currentPage },
                });
                setPatrolLogs(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    per_page: response.data.per_page,
                    total: response.data.total,
                });
            } catch (error) {
                console.error('Error fetching patrol history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatrolHistory();
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setCurrentPage(newPage);
        }
    };

    const filteredLogs = patrolLogs.filter(log =>
        log.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.location.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toString().includes(searchQuery)
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Patrol History" />

            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Patrol History</h1>
                    <p className="text-muted-foreground text-sm">Review your past patrol check-ins and recorded security activities.</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by location name, code, or log ID..."
                        className="bg-card border-zinc-200 pl-9 shadow-sm dark:border-zinc-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Desktop Table View */}
                <div className="rounded-lg border bg-card overflow-hidden hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Location</TableHead>
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Notes</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mb-4" />
                                            <p className="text-sm text-muted-foreground">Loading patrol history...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <FileSearch className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">No patrol logs found</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {searchQuery ? 'Adjust your search or scan patrol points to build your history.' : 'Start scanning patrol points to build your history.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{log.location.name}</div>
                                                    <div className="text-xs text-muted-foreground">{log.location.short_code}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(log.checked_in_at), 'MMM dd, yyyy')}</span>
                                                <span className="text-xs">{format(new Date(log.checked_in_at), 'h:mm a')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                                                {log.notes || '—'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]">
                                                VERIFIED
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {loading ? (
                        <div className="rounded-lg border bg-card p-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            </div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="rounded-lg border bg-card p-12 text-center">
                            <div className="text-muted-foreground/40 flex flex-col items-center gap-2">
                                <FileSearch className="mb-2 h-10 w-10 stroke-[1]" />
                                <p className="text-sm font-semibold">No patrol logs found</p>
                                <p className="text-xs">
                                    {searchQuery ? 'Adjust your search or scan patrol points.' : 'Start scanning patrol points to build your history.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log.id} className="rounded-lg border bg-card p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <div className="font-semibold">{log.location.name}</div>
                                                <div className="text-xs text-muted-foreground">{log.location.short_code}</div>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1 rounded-md font-semibold px-2 py-0.5">
                                                VERIFIED
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="h-3 w-3 shrink-0" />
                                        <div className="text-xs">
                                            <div>{format(new Date(log.checked_in_at), 'MMM dd, yyyy')}</div>
                                            <div>{format(new Date(log.checked_in_at), 'h:mm a')}</div>
                                        </div>
                                    </div>

                                    {log.notes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-muted-foreground">{log.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!loading && filteredLogs.length > 0 && pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-9 w-9"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                                let pageNum;
                                if (pagination.last_page <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= pagination.last_page - 2) {
                                    pageNum = pagination.last_page - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === currentPage ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handlePageChange(pageNum)}
                                        className="h-9 w-9"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.last_page}
                            className="h-9 w-9"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
