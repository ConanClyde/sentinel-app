import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Car, Search, Plus, MoreHorizontal, QrCode, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vehicle Registry', href: route('admin.vehicles.index') },
];

export default function VehicleIndex({ vehicles }: { vehicles: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Registry" />
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Vehicle Registry</h1>
                        <p className="text-muted-foreground text-sm">Track campus vehicle stickers and license plates.</p>
                    </div>
                    <Button size="sm" className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Add Vehicle
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search vehicles..." className="pl-9" />
                </div>

                {/* Vehicles List - Mobile Card View */}
                <div className="grid gap-3">
                    {vehicles.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Car className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground text-center">No vehicles found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        vehicles.map((vehicle: any) => (
                            <Card key={vehicle.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Car className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium font-mono uppercase">{vehicle.plate_number}</p>
                                                {vehicle.is_active && (
                                                    <Badge className="text-xs bg-green-500">Active</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                <span className="truncate">{vehicle.user?.name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {vehicle.qr_code_path && (
                                                <Button variant="ghost" size="icon">
                                                    <QrCode className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
