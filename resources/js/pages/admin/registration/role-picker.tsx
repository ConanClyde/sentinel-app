import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap, Briefcase, Users, QrCode, Shield, Building2, UserCog, X, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModalDrawer, ModalDrawerContent, ModalDrawerHeader, ModalDrawerTitle, ModalDrawerDescription, ModalDrawerFooter } from '@/components/modal-drawer';
import InputError from '@/components/input-error';

interface RolePickerProps {
    roles: string[];
}

const roleConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; description: string }> = {
    'Student': { icon: GraduationCap, color: 'bg-blue-600', description: 'Enrolled student in the institution' },
    'Staff': { icon: Briefcase, color: 'bg-emerald-600', description: 'Faculty or staff member' },
    'Stakeholder': { icon: Users, color: 'bg-amber-600', description: 'Guardian, visitor, or service provider' },
    'Reporter': { icon: QrCode, color: 'bg-purple-600', description: 'Authorized reporter for incidents' },
    'Security Personnel': { icon: Shield, color: 'bg-red-600', description: 'Security personnel on campus' },
    'Department Officer': { icon: Building2, color: 'bg-indigo-600', description: 'Department officer or head' },
    'Administrator': { icon: UserCog, color: 'bg-zinc-800', description: 'System administrator' },
};

export default function RolePicker({ roles }: RolePickerProps) {
    const [kioskMode, setKioskMode] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });


    const handleExitKiosk = (e: React.MouseEvent) => {
        e.preventDefault();
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
            onError: () => {
                // Keep dialog open, show error
            },
        });
    };

    const handleSelect = (role: string) => {
        router.get(route('admin.registration.byRole', { role: toSlug(role) }));
    };

    const handleContinue = () => {
        if (selectedRole) {
            handleSelect(selectedRole);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Registration', href: route('admin.registration.index') },
    ];

    if (kioskMode) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Head title="Kiosk Registration" />
                <div className="w-full max-w-2xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Register New User</h1>
                        <p className="text-muted-foreground text-sm mt-1">Select a role to register</p>
                    </div>

                    <Button variant="outline" onClick={handleExitKiosk} className="fixed bottom-6 right-6 gap-2 shadow-lg">
                        <X className="h-4 w-4" />
                        Exit Kiosk
                    </Button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {roles.map((role) => {
                            const config = roleConfig[role] || { icon: Users, color: 'bg-gray-600', description: '' };
                            const Icon = config.icon;
                            const isSelected = selectedRole === role;
                            return (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-all cursor-pointer ${
                                        isSelected ? 'border-primary bg-primary/5' : 'bg-card hover:bg-muted/50 hover:border-primary/50'
                                    }`}
                                >
                                    <div className={`rounded-lg p-3 ${isSelected ? config.color : 'bg-muted dark:bg-muted/50'} ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{role}</div>
                                        <div className="text-xs text-muted-foreground">{config.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Button onClick={() => selectedRole && handleSelect(selectedRole)} disabled={!selectedRole} className="gap-2">
                            Continue
                        </Button>
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Select Role to Register" />
            <div className="max-w-3xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Register New User</h1>
                    <p className="text-muted-foreground text-sm mt-1">Select a role to register</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roles.map((role) => {
                        const config = roleConfig[role] || { icon: Users, color: 'bg-gray-600', description: '' };
                        const Icon = config.icon;
                        const isSelected = selectedRole === role;

                        return (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-all cursor-pointer ${
                                    isSelected ? 'border-primary bg-primary/5' : 'bg-card hover:bg-muted/50 hover:border-primary/50'
                                }`}
                            >
                                <div className={`rounded-lg p-3 ${isSelected ? config.color : 'bg-muted dark:bg-muted/50'} ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-semibold">{role}</div>
                                    <div className="text-xs text-muted-foreground">{config.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleContinue} disabled={!selectedRole} className="gap-2">
                        Continue
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
