import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, MapPin, Building2, Car, DoorOpen, Square, Ban, Warehouse, Trees, FlameKindling, Bus, Bike, Landmark, Store, School, Utensils, Hospital, Dumbbell, BookOpen, GraduationCap, Clock, ParkingCircle, Armchair, TreeDeciduous, Footprints, ScanLine, Siren, Wifi, Camera, Fan, Wind, Snowflake, Zap, Plug, Droplets, TreePine, Flower2, Leaf, Waves, Anchor, Plane, Train, Truck, Cross, Crosshair, CircleDot, Hexagon, Pentagon, Diamond, Star, Sun, Moon, Cloud, Compass, Navigation, Map, Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Key, Eye, Bell, BellRing, Speaker, Music, Monitor, Laptop, Smartphone, Printer, BatteryFull, Lightbulb, Sofa, BedDouble, DoorClosed, Grid, Box, Package, Folder, File, Clipboard, StickyNote, Bookmark, CalendarDays, Timer, Hourglass, AlarmClock, MoreHorizontal } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfigEmptyState } from './components/ConfigEmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionPagination } from './components/SectionPagination';

const ICON_OPTIONS = [
    { value: 'building-2', label: 'Building', icon: Building2 },
    { value: 'door-open', label: 'Gate', icon: DoorOpen },
    { value: 'car', label: 'Vehicle', icon: Car },
    { value: 'parking-circle', label: 'Parking', icon: ParkingCircle },
    { value: 'clock', label: 'Clock', icon: Clock },
    { value: 'square', label: 'Zone', icon: Square },
    { value: 'ban', label: 'Restricted', icon: Ban },
    { value: 'warehouse', label: 'Warehouse', icon: Warehouse },
    { value: 'trees', label: 'Garden', icon: Trees },
    { value: 'flame-kindling', label: 'Fire', icon: FlameKindling },
    { value: 'bus', label: 'Bus', icon: Bus },
    { value: 'bike', label: 'Bike', icon: Bike },
    { value: 'landmark', label: 'Landmark', icon: Landmark },
    { value: 'store', label: 'Store', icon: Store },
    { value: 'school', label: 'School', icon: School },
    { value: 'utensils', label: 'Cafeteria', icon: Utensils },
    { value: 'hospital', label: 'Clinic', icon: Hospital },
    { value: 'dumbbell', label: 'Gym', icon: Dumbbell },
    { value: 'book-open', label: 'Library', icon: BookOpen },
    { value: 'graduation-cap', label: 'Campus', icon: GraduationCap },
    { value: 'armchair', label: 'Lounge', icon: Armchair },
    { value: 'tree-deciduous', label: 'Park', icon: TreeDeciduous },
    { value: 'footprints', label: 'Walkway', icon: Footprints },
    { value: 'scan-line', label: 'Scanner', icon: ScanLine },
    { value: 'siren', label: 'Emergency', icon: Siren },
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'camera', label: 'Camera', icon: Camera },
    { value: 'fan', label: 'Fan', icon: Fan },
    { value: 'wind', label: 'Wind', icon: Wind },
    { value: 'snowflake', label: 'Cold Storage', icon: Snowflake },
    { value: 'zap', label: 'Power', icon: Zap },
    { value: 'plug', label: 'Electric', icon: Plug },
    { value: 'droplets', label: 'Water', icon: Droplets },
    { value: 'tree-pine', label: 'Forest', icon: TreePine },
    { value: 'flower-2', label: 'Flowers', icon: Flower2 },
    { value: 'leaf', label: 'Green Area', icon: Leaf },
    { value: 'waves', label: 'Pool', icon: Waves },
    { value: 'anchor', label: 'Marina', icon: Anchor },
    { value: 'plane', label: 'Airport', icon: Plane },
    { value: 'train', label: 'Train', icon: Train },
    { value: 'truck', label: 'Delivery', icon: Truck },
    { value: 'cross', label: 'Medical', icon: Cross },
    { value: 'crosshair', label: 'Target', icon: Crosshair },
    { value: 'circle-dot', label: 'Point', icon: CircleDot },
    { value: 'hexagon', label: 'Hex Zone', icon: Hexagon },
    { value: 'pentagon', label: 'Pentagon', icon: Pentagon },
    { value: 'diamond', label: 'Diamond', icon: Diamond },
    { value: 'star', label: 'Star', icon: Star },
    { value: 'sun', label: 'Sunny', icon: Sun },
    { value: 'moon', label: 'Night', icon: Moon },
    { value: 'cloud', label: 'Cloudy', icon: Cloud },
    { value: 'compass', label: 'Compass', icon: Compass },
    { value: 'navigation', label: 'Navigation', icon: Navigation },
    { value: 'map', label: 'Map', icon: Map },
    { value: 'shield', label: 'Security', icon: Shield },
    { value: 'shield-check', label: 'Safe Zone', icon: ShieldCheck },
    { value: 'shield-alert', label: 'Alert Zone', icon: ShieldAlert },
    { value: 'lock', label: 'Lock', icon: Lock },
    { value: 'unlock', label: 'Unlock', icon: Unlock },
    { value: 'key', label: 'Key', icon: Key },
    { value: 'eye', label: 'View', icon: Eye },
    { value: 'bell', label: 'Bell', icon: Bell },
    { value: 'bell-ring', label: 'Alert', icon: BellRing },
    { value: 'speaker', label: 'Speaker', icon: Speaker },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'monitor', label: 'Monitor', icon: Monitor },
    { value: 'laptop', label: 'Lab', icon: Laptop },
    { value: 'smartphone', label: 'Mobile', icon: Smartphone },
    { value: 'printer', label: 'Print', icon: Printer },
    { value: 'battery-full', label: 'Charging', icon: BatteryFull },
    { value: 'lightbulb', label: 'Light', icon: Lightbulb },
    { value: 'sofa', label: 'Sofa', icon: Sofa },
    { value: 'bed-double', label: 'Dorm', icon: BedDouble },
    { value: 'door-closed', label: 'Door', icon: DoorClosed },
    { value: 'grid', label: 'Grid', icon: Grid },
    { value: 'box', label: 'Box', icon: Box },
    { value: 'package', label: 'Package', icon: Package },
    { value: 'folder', label: 'Folder', icon: Folder },
    { value: 'file', label: 'File', icon: File },
    { value: 'clipboard', label: 'Clipboard', icon: Clipboard },
    { value: 'sticky-note', label: 'Note', icon: StickyNote },
    { value: 'bookmark', label: 'Bookmark', icon: Bookmark },
    { value: 'calendar-days', label: 'Event', icon: CalendarDays },
    { value: 'timer', label: 'Timer', icon: Timer },
    { value: 'hourglass', label: 'Hourglass', icon: Hourglass },
    { value: 'alarm-clock', label: 'Alarm', icon: AlarmClock },
];

interface LocationType {
    id: number;
    name: string;
    default_color: string;
    icon: string | null;
}

export function LocationTypeSection({ locationTypes, pagination }: { locationTypes: LocationType[]; pagination?: { current_page: number; last_page: number; total: number } }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<LocationType | null>(null);
    const [form, setForm] = useState({ name: '', default_color: '#3b82f6', icon: '' });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewing, setViewing] = useState<LocationType | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem('openModal') === 'location-types') {
            setOpen(true);
            sessionStorage.removeItem('openModal');
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            router.put(route('admin.config.location-types.update', editing.id), form);
        } else {
            router.post(route('admin.config.location-types.store'), form);
        }
        setOpen(false);
        setEditing(null);
        setForm({ name: '', default_color: '#3b82f6', icon: '' });
    };

    const handleEdit = (lt: LocationType) => {
        setEditing(lt);
        setForm({ name: lt.name, default_color: lt.default_color, icon: lt.icon || '' });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(route('admin.config.location-types.destroy', deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div>
            <ModalDrawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: '', default_color: '#3b82f6', icon: '' }); } }}>
                <ModalDrawerContent>
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>{editing ? 'Edit Location Type' : 'Add Location Type'}</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            {editing ? 'Update the location type details below.' : 'Fill in the location type details below.'}
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Building, Gate, Parking" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Color</Label>
                            <div className="flex gap-2">
                                <Input type="color" value={form.default_color} onChange={(e) => setForm({ ...form, default_color: e.target.value })} className="w-12 h-10 p-1" />
                                <Input value={form.default_color} onChange={(e) => setForm({ ...form, default_color: e.target.value })} className="flex-1 h-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Icon (optional)</Label>
                            <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an icon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ICON_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <opt.icon className="h-4 w-4" />
                                                {opt.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <TableHead className="font-semibold">Color</TableHead>
                            <TableHead className="font-semibold">Icon</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {locationTypes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <ConfigEmptyState
                                        title="No location types yet"
                                        description="Add a location type to get started."
                                        icon={MapPin}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            locationTypes.map((lt) => (
                                <TableRow key={lt.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="w-6 h-6 rounded border" style={{ backgroundColor: lt.default_color }} />
                                    </TableCell>
                                    <TableCell className="font-medium">{lt.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{lt.default_color}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                    {lt.icon ? (
                                        (() => {
                                            const opt = ICON_OPTIONS.find(o => o.value === lt.icon);
                                            return opt ? <opt.icon className="h-4 w-4" /> : lt.icon;
                                        })()
                                    ) : '-'}
                                </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(lt), 0)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDelete(lt.id)} className="text-destructive">
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
                {locationTypes.length === 0 ? (
                    <ConfigEmptyState
                        title="No location types yet"
                        description="Add a location type to get started."
                        icon={MapPin}
                    />
                ) : (
                    locationTypes.map((lt) => (
                        <div key={lt.id} className="rounded-lg border bg-card p-4 mb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded border flex items-center justify-center" style={{ backgroundColor: lt.default_color }}>
                                        {lt.icon ? (() => {
                                            const opt = ICON_OPTIONS.find(o => o.value === lt.icon);
                                            return opt ? <opt.icon className="h-4 w-4" style={{ color: '#fff' }} /> : null;
                                        })() : null}
                                    </div>
                                    <div>
                                        <div className="font-medium">{lt.name}</div>
                                        <div className="text-sm text-muted-foreground">{lt.default_color}</div>
                                    </div>
                                </div>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setTimeout(() => handleEdit(lt), 0)}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleDelete(lt.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <SectionPagination pagination={pagination} routeName="admin.config.location-types" />
            <SectionPagination pagination={pagination} routeName="admin.config.location-types" mobile />

            <ModalDrawer open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Delete Location Type</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to delete this location type? This action cannot be undone.
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
