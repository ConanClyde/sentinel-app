import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Briefcase, Building2, GraduationCap, Loader2, QrCode, Search, Shield, UserCog, Users } from 'lucide-react';
import { useState } from 'react';

import { ProgramCombobox } from '@/components/program-combobox';
import { Badge } from '@/components/ui/badge';

// Modular Components
import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
} from '@/components/modal-drawer';
import { UserHeader } from './components/UserHeader';

// Role Sections
import { UserAvatar } from '@/components/user-avatar';
import { AdminSection } from './AdminSection';
import { DepartmentOfficerSection } from './DepartmentOfficerSection';
import { ReporterSection } from './ReporterSection';
import { SecuritySection } from './SecuritySection';
import { StaffSection } from './StaffSection';
import { StakeholderSection } from './StakeholderSection';
import { StudentSection } from './StudentSection';

interface PaginationInfo {
    current_page: number;
    last_page: number;
    total: number;
}

export default function UserIndex({
    users,
    roles,
    departments,
    stakeholderTypes,
    colleges,
    programs,
    nameExtensions,
    activeRole,
    roleSlug,
    pagination,
    canManage = true,
}: {
    users: any[];
    roles: string[];
    departments?: any[];
    stakeholderTypes?: any[];
    colleges?: any[];
    programs?: any[];
    nameExtensions?: { value: string; label: string }[];
    activeRole: string;
    roleSlug?: string;
    pagination?: PaginationInfo;
    canManage?: boolean;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        first_name: '',
        middle_name: '',
        surname: '',
        email: '',
        role: '',
        role_type_id: '',
        student_id: '',
        staff_id: '',
        stakeholder_type: '',
        college_id: '',
        program_id: '',
        department_id: '',
        license_number: '',
        name_extension: '',
    });

    const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

    const handleView = (user: any) => {
        setSelectedUser(user);
        setViewOpen(true);
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setData({
            first_name: user.first_name || '',
            middle_name: user.middle_name || '',
            surname: user.surname || '',
            email: user.email || '',
            role: user.role || '',
            role_type_id: user.role_type_id ? String(user.role_type_id) : '',
            student_id: user.student_id || '',
            staff_id: user.staff_id || '',
            stakeholder_type: user.stakeholder_type || '',
            college_id: user.college_id ? String(user.college_id) : '',
            program_id: user.program_id ? String(user.program_id) : '',
            department_id: user.department_id ? String(user.department_id) : '',
            license_number: user.license_number || '',
            name_extension: user.name_extension || '',
        });
        clearErrors();
        setEditOpen(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                setEditOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(route('admin.users.destroy', deleteId), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const filteredUsers = users.filter((user: any) => {
        return user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getBreadcrumbs = (): BreadcrumbItem[] => {
        const slug = roleSlug || toSlug(activeRole);
        return [
            { title: 'User Management', href: route('admin.users.index') },
            { title: activeRole, href: route('admin.users.byRole', { role: slug }) },
        ];
    };

    return (
        <AppLayout breadcrumbs={getBreadcrumbs()}>
            <Head title={`${activeRole} Users`} />
            <div className="space-y-4">
                <UserHeader
                    title={`${activeRole} Users`}
                    description={`Manage ${activeRole.toLowerCase()} users.`}
                    activeRole={activeRole}
                    roles={roles}
                    toSlug={toSlug}
                />

                {/* Main Content Area */}
                <div className="flex flex-col gap-6 md:flex-row">
                    {/* Role Sidebar (Desktop) */}
                    <div className="hidden w-48 shrink-0 md:block">
                        <nav className="space-y-1">
                            {roles.map((role) => {
                                const getIcon = (r: string) => {
                                    switch (r) {
                                        case 'Student':
                                            return GraduationCap;
                                        case 'Staff':
                                            return Briefcase;
                                        case 'Stakeholder':
                                            return Users;
                                        case 'Reporter':
                                            return QrCode;
                                        case 'Security Personnel':
                                            return Shield;
                                        case 'Department Officer':
                                            return Building2;
                                        case 'Administrator':
                                            return UserCog;
                                        default:
                                            return Users;
                                    }
                                };
                                const Icon = getIcon(role);
                                return (
                                    <Link
                                        key={role}
                                        href={route('admin.users.byRole', { role: toSlug(role) })}
                                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                            activeRole === role
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {role}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder={`Search ${activeRole.toLowerCase()} users...`}
                                className="bg-card focus:ring-primary/20 border-zinc-200 pl-9 shadow-sm dark:border-zinc-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {(() => {
                            const props = {
                                users: filteredUsers,
                                activeRole: activeRole,
                                onView: handleView,
                                onEdit: canManage ? handleEdit : undefined,
                                onDelete: canManage ? handleDelete : undefined,
                                pagination: pagination,
                                roleSlug: roleSlug || toSlug(activeRole),
                            };

                            switch (activeRole) {
                                case 'Student':
                                    return <StudentSection {...props} />;
                                case 'Staff':
                                    return <StaffSection {...props} />;
                                case 'Stakeholder':
                                    return <StakeholderSection {...props} />;
                                case 'Reporter':
                                    return <ReporterSection {...props} />;
                                case 'Security Personnel':
                                    return <SecuritySection {...props} />;
                                case 'Department Officer':
                                    return <DepartmentOfficerSection {...props} />;
                                case 'Administrator':
                                    return <AdminSection {...props} />;
                                default:
                                    return null;
                            }
                        })()}
                    </div>
                </div>
            </div>

            {/* View User Modal */}
            <ModalDrawer open={viewOpen} onOpenChange={setViewOpen}>
                <ModalDrawerContent className="flex max-h-[80vh] flex-col !gap-0 overflow-hidden !p-0 !pt-0 sm:max-h-[90vh] sm:max-w-[600px] [&>button]:z-50">
                    <ModalDrawerHeader className="bg-background sticky top-0 z-10 shrink-0 border-b px-6 pt-0 pb-4 sm:relative sm:pt-6">
                        <ModalDrawerTitle>User Details</ModalDrawerTitle>
                        <ModalDrawerDescription>Detailed information for {selectedUser?.name}.</ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-6">
                        {/* Hero: avatar + name + role */}
                        <div className="flex items-center gap-4 border-b pb-5">
                            <UserAvatar user={selectedUser} size="lg" />
                            <div className="min-w-0">
                                <h3 className="text-lg leading-tight font-bold">
                                    {[selectedUser?.first_name, selectedUser?.middle_name, selectedUser?.surname, selectedUser?.name_extension]
                                        .filter(Boolean)
                                        .join(' ')}
                                </h3>
                                <p className="text-muted-foreground text-sm">{selectedUser?.email}</p>
                                <Badge className="mt-1.5 text-xs">{selectedUser?.role}</Badge>
                            </div>
                        </div>

                        {/* Identity fields — Label/value pattern matching config pages */}
                        <div className="space-y-3">
                            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Identity</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-xs">First Name</Label>
                                    <div className="font-medium">{selectedUser?.first_name || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground text-xs">Surname</Label>
                                    <div className="font-medium">{selectedUser?.surname || '—'}</div>
                                </div>
                                {selectedUser?.middle_name && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs">Middle Name</Label>
                                        <div className="font-medium">{selectedUser.middle_name}</div>
                                    </div>
                                )}
                                {selectedUser?.name_extension && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs">Extension</Label>
                                        <div className="font-medium">{selectedUser.name_extension}</div>
                                    </div>
                                )}
                                {selectedUser?.license_number && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs">License No.</Label>
                                        <div className="font-mono font-medium">{selectedUser.license_number}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Role-specific section */}
                        {activeRole === 'Student' && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Academic Info</p>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs">Student ID</Label>
                                        <div className="font-mono font-medium">{selectedUser?.student_id || '—'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs">College</Label>
                                        <div className="font-medium">{selectedUser?.college?.name || '—'}</div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-muted-foreground text-xs">Program</Label>
                                        <div className="font-medium">{selectedUser?.program?.name || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeRole === 'Staff' && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Staff Info</p>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs">Staff ID</Label>
                                        <div className="font-mono font-medium">{selectedUser?.staff_id || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeRole === 'Security Personnel' && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Personnel Info</p>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground text-xs">Personnel ID</Label>
                                        <div className="font-mono font-medium">{selectedUser?.staff_id || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeRole === 'Stakeholder' && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Stakeholder Info</p>
                                <div className="space-y-1 text-sm">
                                    <Label className="text-muted-foreground text-xs">Type</Label>
                                    <div className="font-medium">{selectedUser?.stakeholder_type || selectedUser?.role_type?.name || '—'}</div>
                                </div>
                            </div>
                        )}

                        {(activeRole === 'Department Officer' || activeRole === 'Reporter') && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                                    {activeRole === 'Department Officer' ? 'Department' : 'Reporter Type'}
                                </p>
                                <div className="text-sm font-medium">{selectedUser?.role_type?.name || '—'}</div>
                            </div>
                        )}

                        {/* Vehicles section — only if the user has vehicles */}
                        {selectedUser?.vehicles && selectedUser.vehicles.length > 0 && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Registered Vehicles</p>
                                <div className="space-y-2">
                                    {selectedUser.vehicles.map((vehicle: any) => (
                                        <div
                                            key={vehicle.id}
                                            className="bg-muted/30 flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {vehicle.sticker_color && (
                                                    <div
                                                        className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                                                        style={{ backgroundColor: vehicle.sticker_color.hex_code }}
                                                    />
                                                )}
                                                <div>
                                                    <span className="font-mono font-bold tracking-tight uppercase">
                                                        {vehicle.plate_number ?? 'No Plate'}
                                                    </span>
                                                    <span className="text-muted-foreground ml-2 text-xs">{vehicle.vehicle_type?.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs">{vehicle.sticker_number ?? 'PENDING'}</span>
                                                <Badge
                                                    className={`h-4 px-1.5 text-[9px] font-bold ${vehicle.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                                                >
                                                    {vehicle.is_active ? 'Active' : 'Expired'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ID Documents */}
                        {(selectedUser?.student_id_image || selectedUser?.staff_id_image || selectedUser?.license_image) && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Identification Documents</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(selectedUser?.student_id_image || selectedUser?.staff_id_image) && (
                                        <div className="space-y-1.5">
                                            <Label className="text-muted-foreground text-xs">ID Card</Label>
                                            <div className="bg-muted aspect-[3/2] overflow-hidden rounded-lg border">
                                                <img
                                                    src={`/storage/${selectedUser.student_id_image || selectedUser.staff_id_image}`}
                                                    alt="ID"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {selectedUser?.license_image && (
                                        <div className="space-y-1.5">
                                            <Label className="text-muted-foreground text-xs">Driver's License</Label>
                                            <div className="bg-muted aspect-[3/2] overflow-hidden rounded-lg border">
                                                <img
                                                    src={`/storage/${selectedUser.license_image}`}
                                                    alt="License"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Account info */}
                        <div className="space-y-1 border-t pt-4">
                            <Label className="text-muted-foreground text-xs">Member Since</Label>
                            <div className="text-sm font-medium">
                                {selectedUser?.created_at
                                    ? new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : '—'}
                            </div>
                        </div>
                    </div>
                    <ModalDrawerFooter className="bg-muted/20 mt-0 shrink-0 border-t px-6 py-4">
                        <Button variant="outline" className="ml-auto w-full sm:w-auto" onClick={() => setViewOpen(false)}>
                            Close
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>

            {/* Edit User Modal */}
            <ModalDrawer open={editOpen} onOpenChange={setEditOpen}>
                <ModalDrawerContent className="flex max-h-[80vh] flex-col !gap-0 overflow-hidden !p-0 !pt-0 sm:max-h-[90vh] sm:max-w-lg [&>button]:z-50">
                    <ModalDrawerHeader className="bg-background sticky top-0 z-10 shrink-0 border-b px-6 pt-0 pb-4 sm:relative sm:pt-6">
                        <ModalDrawerTitle>Edit User</ModalDrawerTitle>
                        <ModalDrawerDescription>Update the details for {selectedUser?.name}.</ModalDrawerDescription>
                    </ModalDrawerHeader>

                    <form onSubmit={submitEdit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-6">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                {errors.first_name && <p className="text-destructive text-xs">{errors.first_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="middle_name">
                                    Middle Name <span className="text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <Input id="middle_name" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">Surname</Label>
                                <Input id="surname" value={data.surname} onChange={(e) => setData('surname', e.target.value)} />
                                {errors.surname && <p className="text-destructive text-xs">{errors.surname}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name_extension">
                                    Extension <span className="text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <Select value={data.name_extension || undefined} onValueChange={(val) => setData('name_extension', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none" className="pl-3">
                                            None
                                        </SelectItem>
                                        {nameExtensions?.map((ext) => (
                                            <SelectItem key={ext.value} value={ext.value} className="pl-3">
                                                {ext.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                            </div>

                            {activeRole === 'Student' && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="student_id">Student ID</Label>
                                        <Input id="student_id" value={data.student_id} onChange={(e) => setData('student_id', e.target.value)} />
                                        {errors.student_id && <p className="text-destructive text-xs">{errors.student_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Program / College</Label>
                                        <ProgramCombobox
                                            colleges={colleges as any}
                                            value={data.program_id}
                                            onChange={(programId, collegeId) => {
                                                setData('program_id', programId);
                                                setData('college_id', collegeId);
                                            }}
                                            placeholder="Search program..."
                                        />
                                    </div>
                                </div>
                            )}

                            {activeRole === 'Staff' && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="staff_id">Staff ID</Label>
                                        <Input id="staff_id" value={data.staff_id} onChange={(e) => setData('staff_id', e.target.value)} />
                                        {errors.staff_id && <p className="text-destructive text-xs">{errors.staff_id}</p>}
                                    </div>
                                </div>
                            )}

                            {activeRole === 'Security Personnel' && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="staff_id">Personnel ID</Label>
                                        <Input id="staff_id" value={data.staff_id} onChange={(e) => setData('staff_id', e.target.value)} />
                                        {errors.staff_id && <p className="text-destructive text-xs">{errors.staff_id}</p>}
                                    </div>
                                </div>
                            )}

                            {activeRole === 'Reporter' && departments && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <Label>Reporter Type</Label>
                                        <Select value={data.role_type_id} onValueChange={(val) => setData('role_type_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select reporter type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments
                                                    .filter((d: any) => d.main_role === 'Reporter')
                                                    .map((d: any) => (
                                                        <SelectItem key={d.id} value={String(d.id)}>
                                                            {d.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.role_type_id && <p className="text-destructive text-xs">{errors.role_type_id}</p>}
                                    </div>
                                </div>
                            )}

                            {activeRole === 'Department Officer' && departments && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <Select
                                            value={data.role_type_id}
                                            onValueChange={(val) => setData((prev) => ({ ...prev, role_type_id: val, department_id: val }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments
                                                    .filter((d: any) => d.main_role === 'Department')
                                                    .map((d: any) => (
                                                        <SelectItem key={d.id} value={String(d.id)}>
                                                            {d.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.role_type_id && <p className="text-destructive text-xs">{errors.role_type_id}</p>}
                                    </div>
                                </div>
                            )}

                            {activeRole === 'Stakeholder' && stakeholderTypes && (
                                <div className="space-y-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <Label>Stakeholder Type</Label>
                                        <Select
                                            value={data.role_type_id}
                                            onValueChange={(val) => {
                                                const type = stakeholderTypes.find((t: any) => String(t.id) === val);
                                                setData((prev) => ({ ...prev, role_type_id: val, stakeholder_type: type?.name || '' }));
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stakeholderTypes.map((t: any) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.stakeholder_type && <p className="text-destructive text-xs">{errors.stakeholder_type}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <ModalDrawerFooter className="bg-muted/20 mt-0 shrink-0 border-t px-6 py-4">
                            <Button type="submit" className="w-full sm:ml-auto sm:w-auto" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </ModalDrawerFooter>
                    </form>
                </ModalDrawerContent>
            </ModalDrawer>

            <ModalDrawer open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
                <ModalDrawerContent className="sm:max-w-md">
                    <ModalDrawerHeader>
                        <ModalDrawerTitle>Delete User</ModalDrawerTitle>
                        <ModalDrawerDescription>
                            Are you sure you want to permanently delete this account? This action cannot be undone.
                        </ModalDrawerDescription>
                    </ModalDrawerHeader>
                    <ModalDrawerFooter className="flex-row gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 flex-1 text-white">
                            Delete
                        </Button>
                    </ModalDrawerFooter>
                </ModalDrawerContent>
            </ModalDrawer>
        </AppLayout>
    );
}
