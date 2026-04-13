import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap, Briefcase, Users, QrCode, Shield, Building2, UserCog, X, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { StudentRegistration } from './StudentRegistration';
import { StaffRegistration } from './StaffRegistration';
import { StakeholderRegistration } from './StakeholderRegistration';
import { ReporterRegistration } from './ReporterRegistration';
import { SecurityRegistration } from './SecurityRegistration';
import { DepartmentOfficerRegistration } from './DepartmentOfficerRegistration';
import { AdminRegistration } from './AdminRegistration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModalDrawer, ModalDrawerContent, ModalDrawerHeader, ModalDrawerTitle, ModalDrawerDescription, ModalDrawerFooter } from '@/components/modal-drawer';
import InputError from '@/components/input-error';

interface College {
    id: number;
    name: string;
    code: string;
    programs: { id: number; name: string; code: string }[];
}

interface RoleType {
    id: number;
    name: string;
    main_role: string;
}

interface Department {
    id: number;
    name: string;
    description?: string;
}

interface VehicleType {
    id: number;
    name: string;
    has_plate_number: boolean | number;
}

export default function RegistrationIndex({ roles, activeRole, roleSlug, colleges, stakeholderTypes, departments, vehicleTypes }: { roles: string[], activeRole: string, roleSlug?: string, colleges?: College[], stakeholderTypes?: RoleType[], departments?: Department[], vehicleTypes?: VehicleType[] }) {
    const kioskMode = true;
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const props = { colleges, stakeholderTypes, departments, vehicleTypes };

    const handleExitKiosk = () => {
        setShowExitConfirm(true);
    };

    const confirmExit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onSuccess: () => {
                setShowExitConfirm(false);
                reset('password');
                router.get(route('dashboard'));
            },
        });
    };

    const renderSection = () => {
        const roleSlugMap: Record<string, string> = {
            'Student': 'student',
            'Staff': 'staff',
            'Stakeholder': 'stakeholder',
            'Reporter': 'reporter',
            'Security Personnel': 'security',
            'Department Officer': 'department-officer',
            'Administrator': 'administrator',
        };
        const role = roleSlugMap[activeRole] || 'student';

        switch (activeRole) {
            case 'Student': return <StudentRegistration role={role} vehicleTypes={vehicleTypes} colleges={colleges} />;
            case 'Staff': return <StaffRegistration role={role} vehicleTypes={vehicleTypes} />;
            case 'Stakeholder': return <StakeholderRegistration role={role} stakeholderTypes={stakeholderTypes} vehicleTypes={vehicleTypes} />;
            case 'Reporter': return <ReporterRegistration role={role} departments={departments} />;
            case 'Security Personnel': return <SecurityRegistration role={role} vehicleTypes={vehicleTypes} />;
            case 'Department Officer': return <DepartmentOfficerRegistration role={role} departments={departments} />;
            case 'Administrator': return <AdminRegistration role={role} />;
            default: return <div className="text-muted-foreground">Registration for {activeRole} coming soon...</div>;
        }
    };

    const getBreadcrumbs = (): BreadcrumbItem[] => {
        const slug = roleSlug || toSlug(activeRole);
        return [
            { title: 'Registration', href: route('admin.registration.index') },
            { title: activeRole, href: route('admin.registration.byRole', { role: slug }) },
        ];
    };

    const content = (
        <>
            <Head title={`Register ${activeRole}`} />
            <div className="flex flex-col gap-6">
                {renderSection()}
            </div>
        </>
    );

    if (kioskMode) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <Button variant="outline" onClick={handleExitKiosk} className="fixed bottom-6 right-6 gap-2 shadow-lg">
                    <X className="h-4 w-4" />
                    Exit Kiosk
                </Button>

                <div className="w-full max-w-2xl">
                    <div className="space-y-1.5 text-center mb-6">
                        <h1 className="text-2xl font-semibold tracking-tight">Register {activeRole}</h1>
                        <p className="text-muted-foreground text-sm">Create a new {activeRole.toLowerCase()} account.</p>
                    </div>
                    <div className="flex flex-col gap-6">
                        {renderSection()}
                    </div>
                </div>

                <ModalDrawer open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                    <ModalDrawerContent>
                        <form onSubmit={confirmExit}>
                            <ModalDrawerHeader>
                                <ModalDrawerTitle>Exit Kiosk Mode</ModalDrawerTitle>
                                <ModalDrawerDescription>
                                    Enter your password to exit kiosk mode and access other pages.
                                </ModalDrawerDescription>
                            </ModalDrawerHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        autoFocus
                                    />
                                    <InputError message={errors.password} />
                                </div>
                            </div>
                            <ModalDrawerFooter>
                                <Button type="button" variant="outline" onClick={() => setShowExitConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing || !data.password}>
                                    {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Confirm
                                </Button>
                            </ModalDrawerFooter>
                        </form>
                    </ModalDrawerContent>
                </ModalDrawer>
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={getBreadcrumbs()}>
            {content}
        </AppLayout>
    );
}
