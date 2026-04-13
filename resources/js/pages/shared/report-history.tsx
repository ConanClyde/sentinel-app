import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    MapPin,
    ShieldAlert,
    ImageIcon,
    FileSearch,
    Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { ModalDrawer, ModalDrawerContent, ModalDrawerHeader, ModalDrawerTitle, ModalDrawerDescription, ModalDrawerFooter } from '@/components/modal-drawer';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Registry', href: route('shared.vehicles') },
    { title: 'Report History', href: route('shared.report-history') },
];

interface Violation {
    id: number;
    violation_type_id: number;
    description: string;
    location: string;
    status: 'pending' | 'approved' | 'rejected' | 'resolved' | string;
    reported_at: string;
    evidence_image: string | null;
    remarks: string | null;
    violator_sticker_number?: string;
    vehicle?: {
        plate_number: string | null;
        user?: {
            name: string;
        };
    };
    violation_type?: {
        name: string;
    };
    reporter?: {
        name: string;
    };
    assignee?: {
        name: string;
    };
}

export default function ReportHistory({ violations = [], violationsPagination }: { violations: Violation[]; violationsPagination?: { current_page: number; last_page: number; total: number } }) {
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredViolations = violations.filter(v =>
        (v.vehicle?.plate_number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.violator_sticker_number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.id.toString().includes(searchQuery)
    );

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'pending': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><Clock className="h-3 w-3" /> PENDING</Badge>;
            case 'approved': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><CheckCircle2 className="h-3 w-3" /> APPROVED</Badge>;
            case 'rejected': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><XCircle className="h-3 w-3" /> REJECTED</Badge>;
            case 'resolved': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 rounded-md font-semibold px-2 py-0.5 text-[10px]"><CheckCircle2 className="h-3 w-3" /> RESOLVED</Badge>;
            default: return <Badge variant="outline" className="rounded-md font-semibold px-2 py-0.5 text-[10px]">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report History" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Violation Archive
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Report History
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-xl">
                        View all violations and citations associated with your registered vehicles.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by plate, sticker, or report ID..."
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
                                <TableHead className="font-semibold">Plate / Sticker</TableHead>
                                <TableHead className="font-semibold">Violation</TableHead>
                                <TableHead className="font-semibold">Location</TableHead>
                                <TableHead className="font-semibold">Date</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredViolations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <FileSearch className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">No violations found</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {searchQuery ? 'Adjust your search or maintain authorized parking.' : 'No violations have been recorded for your vehicles.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredViolations.map((violation) => (
                                    <TableRow key={violation.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-mono font-bold tracking-tight uppercase">
                                            {violation.vehicle?.plate_number || violation.violator_sticker_number || 'UNIDENTIFIED'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{violation.violation_type?.name || '---'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span>{violation.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(violation.reported_at), 'MMM dd, yyyy')}</span>
                                                <span className="text-xs">{format(new Date(violation.reported_at), 'h:mm a')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(violation.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setSelectedViolation(violation)}>
                                                <Eye className="h-3.5 w-3.5" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {filteredViolations.length === 0 ? (
                        <div className="rounded-lg border bg-card p-12 text-center">
                            <div className="text-muted-foreground/40 flex flex-col items-center gap-2">
                                <FileSearch className="mb-2 h-10 w-10 stroke-[1]" />
                                <p className="text-sm font-semibold">No violations found</p>
                                <p className="text-xs">
                                    {searchQuery ? 'Adjust your search.' : 'No violations have been recorded for your vehicles.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredViolations.map((violation) => (
                            <div key={violation.id} className="rounded-lg border bg-card p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="font-mono font-bold tracking-tight uppercase text-base mb-1">
                                            {violation.vehicle?.plate_number || violation.violator_sticker_number || 'UNIDENTIFIED'}
                                        </div>
                                        <div className="text-sm font-medium mb-2">
                                            {violation.violation_type?.name || '---'}
                                        </div>
                                        <div className="mb-2">{getStatusBadge(violation.status)}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 -mt-1" onClick={() => setSelectedViolation(violation)}>
                                        <Eye className="h-3.5 w-3.5" />
                                        View
                                    </Button>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <span className="text-xs">{violation.location}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span>{format(new Date(violation.reported_at), 'MMM dd, yyyy')}</span>
                                            <span>{format(new Date(violation.reported_at), 'h:mm a')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                {violationsPagination && violationsPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('shared.report-history') + '?page=' + (violationsPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: violationsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('shared.report-history') + '?page=' + page} isActive={violationsPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('shared.report-history') + '?page=' + (violationsPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {violationsPagination && violationsPagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={route('shared.report-history') + '?page=' + (violationsPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: violationsPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('shared.report-history') + '?page=' + page} isActive={violationsPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('shared.report-history') + '?page=' + (violationsPagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Detail Modal */}
            <ModalDrawer
                open={!!selectedViolation}
                onOpenChange={(open) => {
                    if (!open) setSelectedViolation(null);
                }}
            >
                <ModalDrawerContent className="flex max-h-[80vh] flex-col !gap-0 overflow-hidden !p-0 !pt-0 sm:max-w-2xl [&>button]:z-50">
                    <ModalDrawerHeader className="bg-background sticky top-0 z-10 shrink-0 border-b px-6 pt-0 pb-4 sm:relative sm:pt-6">
                        <div className="flex items-center gap-2 mb-1">
                            {selectedViolation && getStatusBadge(selectedViolation.status)}
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Incident Documentation</span>
                        </div>
                        <ModalDrawerTitle>Incident Summary</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Report details for {selectedViolation?.vehicle?.plate_number || selectedViolation?.violator_sticker_number || 'this violation'}.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-6">
                        {/* Violation Info */}
                        <div className="space-y-3">
                            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Violation Info</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-xs">Violation Type</Label>
                                    <div className="font-medium">{selectedViolation?.violation_type?.name || '---'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-xs">Plate Number</Label>
                                    <div className="font-mono font-bold tracking-tight uppercase">{selectedViolation?.vehicle?.plate_number || selectedViolation?.violator_sticker_number || '---'}</div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-muted-foreground text-xs">Location</Label>
                                    <div className="font-medium">{selectedViolation?.location || '---'}</div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-muted-foreground text-xs">Description</Label>
                                    <div className="font-medium text-sm italic text-muted-foreground leading-relaxed">
                                        "{selectedViolation?.description || 'No description provided.'}"
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Official Verdict */}
                        {selectedViolation?.remarks && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Official Verdict</p>
                                <div className="p-4 rounded-lg bg-muted/30 border border-muted/20">
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        {selectedViolation.remarks}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Evidence */}
                        <div className="space-y-3 border-t pt-4">
                            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Photographic Evidence</p>
                            <div className="aspect-video rounded-lg bg-muted/20 border overflow-hidden">
                                {selectedViolation?.evidence_image ? (
                                    <img
                                        src={`/storage/${selectedViolation.evidence_image}`}
                                        className="w-full h-full object-cover"
                                        alt="Evidence"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                                        <ImageIcon className="h-8 w-8" />
                                        No Visual Data
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <ModalDrawerFooter className="bg-muted/20 mt-0 shrink-0 border-t px-6 py-4">
                        <Button variant="outline" className="ml-auto w-full sm:w-auto" onClick={() => setSelectedViolation(null)}>
                            Close
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
