import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Palette, Calendar, Hash, Users, Save } from 'lucide-react';
import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
    ModalDrawerTrigger
} from '@/components/modal-drawer';

interface StickerColor {
    id: number;
    name: string;
    hex_code: string;
}

interface RoleType {
    id: number;
    name: string;
    main_role: string;
}

interface StickerRule {
    student_expiration_years: number;
    staff_expiration_years: number;
    security_expiration_years: number;
    stakeholder_expiration_years: number;
    staff_color: string;
    security_color: string;
    student_map: Record<string, string>;
    stakeholder_map: Record<string, string>;
}

interface Props {
    stickerRules: StickerRule;
    stickerColors: StickerColor[];
    roleTypes: RoleType[];
}

export function StickerRuleSection({ stickerRules, stickerColors, roleTypes }: Props) {
    const [isPeriodsDrawerOpen, setIsPeriodsDrawerOpen] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        ...stickerRules
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.config.sticker-rules.update'));
    };

    const updateStudentMap = (key: string, color: string) => {
        setData('student_map', {
            ...data.student_map,
            [key]: color
        });
    };

    const updateStakeholderMap = (key: string, color: string) => {
        setData('stakeholder_map', {
            ...data.stakeholder_map,
            [key]: color
        });
    };

    return (
        <>
        <form id="sticker-rules-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Sticker Generation Rules</h2>
                    <p className="text-sm text-muted-foreground">Configure expiration periods and color mapping logic.</p>
                </div>
                <Button type="submit" disabled={processing} className="hidden md:inline-flex gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Expiration Periods (Years)
                        </CardTitle>
                        <CardDescription>Validity duration for vehicle stickers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Desktop Grid Layout */}
                        <div className="hidden md:grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Student</Label>
                                <Input type="number" value={data.student_expiration_years} onChange={e => setData('student_expiration_years', parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Staff</Label>
                                <Input type="number" value={data.staff_expiration_years} onChange={e => setData('staff_expiration_years', parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Security</Label>
                                <Input type="number" value={data.security_expiration_years} onChange={e => setData('security_expiration_years', parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Stakeholder</Label>
                                <Input type="number" value={data.stakeholder_expiration_years} onChange={e => setData('stakeholder_expiration_years', parseInt(e.target.value))} />
                            </div>
                        </div>

                        {/* Mobile Summary List */}
                        <div className="md:hidden space-y-3">
                            <div className="divide-y rounded-lg border overflow-hidden">
                                <div className="flex justify-between p-3 bg-muted/20">
                                    <span className="text-sm text-muted-foreground">Student</span>
                                    <span className="text-sm font-bold font-mono">{data.student_expiration_years} YRS</span>
                                </div>
                                <div className="flex justify-between p-3 bg-muted/20">
                                    <span className="text-sm text-muted-foreground">Staff</span>
                                    <span className="text-sm font-bold font-mono">{data.staff_expiration_years} YRS</span>
                                </div>
                                <div className="flex justify-between p-3 bg-muted/20">
                                    <span className="text-sm text-muted-foreground">Security</span>
                                    <span className="text-sm font-bold font-mono">{data.security_expiration_years} YRS</span>
                                </div>
                                <div className="flex justify-between p-3 bg-muted/20">
                                    <span className="text-sm text-muted-foreground">Stakeholder</span>
                                    <span className="text-sm font-bold font-mono">{data.stakeholder_expiration_years} YRS</span>
                                </div>
                            </div>

                            {/* Mobile Drawer Trigger - Now at the bottom */}
                            <ModalDrawer open={isPeriodsDrawerOpen} onOpenChange={setIsPeriodsDrawerOpen}>
                                <ModalDrawerTrigger asChild>
                                    <Button variant="outline" className="w-full h-10 gap-2 border-dashed">
                                        Edit Expiration Periods
                                    </Button>
                                </ModalDrawerTrigger>
                                <ModalDrawerContent>
                                    <ModalDrawerHeader>
                                        <ModalDrawerTitle className="text-xl font-bold">Sticker Expiration Rules</ModalDrawerTitle>
                                        <ModalDrawerDescription> Set validity duration for vehicle stickers.</ModalDrawerDescription>
                                    </ModalDrawerHeader>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 gap-5">
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">Student Validity</Label>
                                                <Input type="number" value={data.student_expiration_years} onChange={e => setData('student_expiration_years', parseInt(e.target.value))} className="h-10 text-sm" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">Staff Validity</Label>
                                                <Input type="number" value={data.staff_expiration_years} onChange={e => setData('staff_expiration_years', parseInt(e.target.value))} className="h-10 text-sm" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">Security Validity</Label>
                                                <Input type="number" value={data.security_expiration_years} onChange={e => setData('security_expiration_years', parseInt(e.target.value))} className="h-10 text-sm" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">Stakeholder Validity</Label>
                                                <Input type="number" value={data.stakeholder_expiration_years} onChange={e => setData('stakeholder_expiration_years', parseInt(e.target.value))} className="h-10 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <ModalDrawerFooter className="px-0 pt-4">
                                        <Button className="w-full h-11 text-sm font-bold shadow-sm" onClick={() => setIsPeriodsDrawerOpen(false)}>
                                            Done
                                        </Button>
                                    </ModalDrawerFooter>
                                </ModalDrawerContent>
                            </ModalDrawer>
                        </div>
                    </CardContent>
                </Card>

                {/* Default Role Colors */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            Default Role Colors
                        </CardTitle>
                        <CardDescription>Assigned colors for non-student roles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Staff Default Color</Label>
                                <Select value={data.staff_color} onValueChange={val => setData('staff_color', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stickerColors.map(c => (
                                            <SelectItem key={c.id} value={c.name}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex_code }} />
                                                    {c.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Security Default Color</Label>
                                <Select value={data.security_color} onValueChange={val => setData('security_color', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stickerColors.map(c => (
                                            <SelectItem key={c.id} value={c.name}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex_code }} />
                                                    {c.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Student Plate Mapping */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Hash className="h-4 w-4 text-primary" />
                            Student Plate Mapping (Last Digit)
                        </CardTitle>
                        <CardDescription>Map the last digit of vehicle plates to specific sticker colors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop Table View */}
                        <div className="rounded-md border hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plate Digits</TableHead>
                                        <TableHead>Assigned Color</TableHead>
                                        <TableHead className="text-right">Hex Preview</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(data.student_map).map(([key, color]) => (
                                        <TableRow key={key}>
                                            <TableCell className="font-medium">
                                                {key === 'no_plate' ? (
                                                    <Badge variant="outline">No Plate</Badge>
                                                ) : (
                                                    <span className="text-lg font-mono tracking-widest">{key.split('').join(' & ')}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select value={color} onValueChange={val => updateStudentMap(key, val)}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {stickerColors.map(c => (
                                                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stickerColors.find(c => c.name === color)?.hex_code }} />
                                                    <span className="text-xs font-mono">{stickerColors.find(c => c.name === color)?.hex_code}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile List View */}
                        <div className="space-y-3 md:hidden">
                            {Object.entries(data.student_map).map(([key, color]) => (
                                <div key={key} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Plate Digits</Label>
                                        {key === 'no_plate' ? (
                                            <Badge variant="outline">No Plate</Badge>
                                        ) : (
                                            <span className="text-lg font-mono tracking-widest font-bold">{key.split('').join(' & ')}</span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Sticker Color</Label>
                                        <Select value={color} onValueChange={val => updateStudentMap(key, val)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stickerColors.map(c => (
                                                    <SelectItem key={c.id} value={c.name}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex_code }} />
                                                            {c.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Stakeholder Type Mapping */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Stakeholder Role Mapping
                        </CardTitle>
                        <CardDescription>Assign colors based on specific stakeholder categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop Table View */}
                        <div className="rounded-md border hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Stakeholder Category</TableHead>
                                        <TableHead>Assigned Color</TableHead>
                                        <TableHead className="text-right">Hex Preview</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roleTypes.filter(rt => rt.main_role === 'Stakeholder').map(rt => (
                                        <TableRow key={rt.id}>
                                            <TableCell className="font-medium">{rt.name}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={data.stakeholder_map[rt.name] || 'White'}
                                                    onValueChange={val => updateStakeholderMap(rt.name, val)}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {stickerColors.map(c => (
                                                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stickerColors.find(c => c.name === (data.stakeholder_map[rt.name] || 'White'))?.hex_code }} />
                                                    <span className="text-xs font-mono">{stickerColors.find(c => c.name === (data.stakeholder_map[rt.name] || 'White'))?.hex_code}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile List View */}
                        <div className="space-y-3 md:hidden">
                            {roleTypes.filter(rt => rt.main_role === 'Stakeholder').map(rt => (
                                <div key={rt.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Category</Label>
                                        <span className="font-bold">{rt.name}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Sticker Color</Label>
                                        <Select
                                            value={data.stakeholder_map[rt.name] || 'White'}
                                            onValueChange={val => updateStakeholderMap(rt.name, val)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stickerColors.map(c => (
                                                    <SelectItem key={c.id} value={c.name}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex_code }} />
                                                            {c.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </form>
        {/* Fixed Action Bar - Mobile Only */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3.5 z-50 transition-all md:hidden">
            <div className="flex items-center justify-center gap-3">
                <Button
                    type="button"
                    onClick={() => document.getElementById('sticker-rules-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                    disabled={processing}
                    className="w-full md:w-auto h-11 px-8 shadow-sm transition-all active:scale-[0.98] gap-2"
                >
                    <Save className="h-4 w-4 stroke-[2.5]" />
                    {processing ? 'Saving changes...' : 'Save all changes'}
                </Button>
            </div>
        </div>
        </>
    );
}
