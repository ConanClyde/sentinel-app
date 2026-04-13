import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User as AppUser } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerDescription,
    ModalDrawerFooter,
    ModalDrawerHeader,
    ModalDrawerTitle,
    ModalDrawerTrigger,
} from '@/components/modal-drawer';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User, Mail, Shield, Car, Calendar, Edit, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Profile', href: route('profile') },
];

interface ProfilePageProps extends SharedData {
    mustVerifyEmail?: boolean;
    nameExtensions?: { value: string; label: string }[];
}

export default function Profile() {
    const { auth, nameExtensions = [] } = usePage<ProfilePageProps>().props;
    const user = auth.user as AppUser;
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        first_name: user?.first_name || '',
        middle_name: user?.middle_name || '',
        surname: user?.surname || '',
        name_extension: user?.name_extension || '',
        email: user?.email || '',
    });

    useEffect(() => {
        setData({
            first_name: user?.first_name || '',
            middle_name: user?.middle_name || '',
            surname: user?.surname || '',
            name_extension: user?.name_extension || '',
            email: user?.email || '',
        });
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'), {
            onSuccess: () => {
                setEditDialogOpen(false);
                router.reload({ only: ['auth'] });
            },
        });
    };

    const getFullName = () => {
        const parts = [
            user?.first_name,
            user?.middle_name ? user.middle_name.charAt(0) + '.' : '',
            user?.surname,
            user?.name_extension,
        ].filter(Boolean);
        return parts.join(' ');
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'Administrator':
                return 'destructive';
            case 'Student':
                return 'default';
            case 'Staff':
                return 'secondary';
            case 'Stakeholder':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                        <p className="text-muted-foreground text-sm">View and manage your account information</p>
                    </div>
                    <ModalDrawer open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <ModalDrawerTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Button>
                        </ModalDrawerTrigger>
                        <ModalDrawerContent>
                            <form onSubmit={handleSubmit}>
                                <ModalDrawerHeader>
                                    <ModalDrawerTitle>Edit Profile</ModalDrawerTitle>
                                    <ModalDrawerDescription>
                                        Update your personal information below.
                                    </ModalDrawerDescription>
                                </ModalDrawerHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className={errors.first_name ? 'border-red-500' : ''}
                                        />
                                        {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="middle_name">Middle Name</Label>
                                        <Input
                                            id="middle_name"
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                            className={errors.middle_name ? 'border-red-500' : ''}
                                        />
                                        {errors.middle_name && <p className="text-sm text-red-500">{errors.middle_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="surname">Surname</Label>
                                        <Input
                                            id="surname"
                                            value={data.surname}
                                            onChange={(e) => setData('surname', e.target.value)}
                                            className={errors.surname ? 'border-red-500' : ''}
                                        />
                                        {errors.surname && <p className="text-sm text-red-500">{errors.surname}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name_extension">Name Extension</Label>
                                        <Select
                                            value={data.name_extension || 'none'}
                                            onValueChange={(value) => setData('name_extension', value === 'none' ? '' : value)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                                <SelectItem value="none" className="pl-3">None</SelectItem>
                                                {nameExtensions?.map((ext: any) => (
                                                    <SelectItem key={ext.value} value={ext.value} className="pl-3">
                                                        {ext.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.name_extension && <p className="text-sm text-red-500">{errors.name_extension}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                </div>
                                <ModalDrawerFooter>
                                    <Button type="button" variant="ghost" onClick={() => setEditDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </ModalDrawerFooter>
                            </form>
                        </ModalDrawerContent>
                    </ModalDrawer>
                </div>

                {/* Profile Card */}
                <Card className="border-border">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-4 text-left">
                            <UserAvatar user={user} size="xl" />
                            <div className="flex-1">
                                <CardTitle className="text-xl leading-tight">{getFullName()}</CardTitle>
                                <CardDescription className="mt-1">{user?.email}</CardDescription>
                                <Badge className="mt-2" variant={getRoleBadgeVariant(user?.role)}>
                                    {user?.role}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Personal Information */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Your personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">First Name</label>
                                <p className="text-sm font-medium mt-1">{user?.first_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Middle Name</label>
                                <p className="text-sm font-medium mt-1">{user?.middle_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Surname</label>
                                <p className="text-sm font-medium mt-1">{user?.surname || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name Extension</label>
                                <p className="text-sm font-medium mt-1">{user?.name_extension || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <p className="text-sm font-medium mt-1 flex items-center gap-2 truncate">
                                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate">{user?.email}</span>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <p className="text-sm font-medium mt-1 flex items-center gap-2">
                                    <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    {user?.role}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                                <p className="text-sm font-medium mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Information */}
                {user?.role === 'Student' || user?.role === 'Staff' || user?.role === 'Stakeholder' ? (
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Car className="h-5 w-5" />
                                Registered Vehicles
                            </CardTitle>
                            <CardDescription>Your registered vehicles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No vehicles registered</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </AppLayout>
    );
}
