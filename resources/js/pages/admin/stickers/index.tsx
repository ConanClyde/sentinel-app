import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Car, Download, ExternalLink, Printer, QrCode, Search, Ticket } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Vehicle Stickers', href: route('admin.stickers.index') }];

export default function Stickers({ vehicles = [], stickersPagination }: { vehicles: any[]; stickersPagination?: { current_page: number; last_page: number; total: number } }) {
    const [search, setSearch] = useState('');

    const filteredVehicles = vehicles.filter(
        (v) =>
            v.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
            v.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            v.sticker_number?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Stickers" />
            <div className="flex flex-col gap-4 pb-20 sm:gap-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl font-bold tracking-tight">Sticker Management</h1>
                    <p className="text-muted-foreground text-sm">Issue and track university vehicle access stickers.</p>
                </div>

                <div className="w-full space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search by plate, owner, or sticker #..."
                                className="bg-card focus:ring-primary/20 border-zinc-200 pl-9 shadow-sm dark:border-zinc-800"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-11 gap-2">
                            <Printer className="h-4 w-4" /> Batch Print
                        </Button>
                    </div>

                    {filteredVehicles.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center border-dashed py-12 text-center">
                            <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                                <Ticket className="text-muted-foreground h-6 w-6" />
                            </div>
                            <p className="text-muted-foreground">No stickers match your criteria</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredVehicles.map((vehicle) => (
                                <Card key={vehicle.id} className="group overflow-hidden transition-all hover:shadow-md">
                                    <CardContent className="p-0">
                                        <div className="bg-muted/30 flex items-center gap-4 border-b p-4">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded text-white"
                                                style={{ backgroundColor: vehicle.sticker_color?.hex_code }}
                                            >
                                                <QrCode className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold">{vehicle.plate_number}</span>
                                                    <Badge variant="outline" className="h-4 px-1 py-0 text-[10px] font-bold uppercase">
                                                        {vehicle.sticker_number}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground truncate text-xs">{vehicle.user?.name}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {vehicle.expires_at
                                                            ? `Valid until ${new Date(vehicle.expires_at).getFullYear()}`
                                                            : 'No expiration set'}
                                                    </span>
                                                </div>
                                                <div className="text-muted-foreground flex items-center gap-1.5">
                                                    <Car className="h-3 w-3" />
                                                    <span>{vehicle.vehicle_type?.name}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="secondary" size="sm" className="h-9 gap-2 text-[11px]" asChild>
                                                    <a href={`/storage/${vehicle.qr_code_path}`} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-3.5 w-3.5" /> Preview
                                                    </a>
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-9 gap-2 text-[11px]" asChild>
                                                    <a href={`/storage/${vehicle.qr_code_path}`} download>
                                                        <Download className="h-3.5 w-3.5" /> Download
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                {stickersPagination && stickersPagination.last_page > 1 && (
                    <div className="py-4 ml-auto w-fit">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={route('admin.stickers.index') + '?page=' + (stickersPagination.current_page - 1)} />
                                </PaginationItem>
                                {Array.from({ length: stickersPagination.last_page }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink href={route('admin.stickers.index') + '?page=' + page} isActive={stickersPagination.current_page === page}>
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext href={route('admin.stickers.index') + '?page=' + (stickersPagination.current_page + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Mobile Pagination */}
            {stickersPagination && stickersPagination.last_page > 1 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-x p-4 md:hidden flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={route('admin.stickers.index') + '?page=' + (stickersPagination.current_page - 1)} />
                            </PaginationItem>
                            {Array.from({ length: stickersPagination.last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink href={route('admin.stickers.index') + '?page=' + page} isActive={stickersPagination.current_page === page}>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext href={route('admin.stickers.index') + '?page=' + (stickersPagination.current_page + 1)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </AppLayout>
    );
}
