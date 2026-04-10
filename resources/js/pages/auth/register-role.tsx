import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Shield, User, GraduationCap, Briefcase, Eye, PenLine, Users } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import { Alert } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

interface MainRole {
    value: string;
    label: string;
    requiresApproval: boolean;
    description: string;
    color: string;
    borderColor: string;
}

interface RegisterRoleProps {
    mainRoles: MainRole[];
    savedMainRole?: string;
}

interface RegisterRoleForm {
    [key: string]: string;
    main_role: string;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Administrator: Shield,
    Department: Briefcase,
    Student: GraduationCap,
    Staff: Briefcase,
    Security: Eye,
    Reporter: PenLine,
    Stakeholder: Users,
};

export default function RegisterRole({ mainRoles, savedMainRole }: RegisterRoleProps) {
    const { data, setData, post, processing, errors } = useForm<RegisterRoleForm>({
        main_role: savedMainRole || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.store-role'), {
            onSuccess: () => toast.success('Role selected.'),
            onError: () => toast.error('Please select a valid role.'),
        });
    };

    return (
        <AuthLayout title="Select Your Role" description="Choose your role to get started" backHref={route('home')} showHomeIcon>
            <Head title="Select Role" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 py-2 text-sm">
                    All registrations require admin approval before you can log in.
                </Alert>

                <div className="grid grid-cols-1 gap-4">
                    {mainRoles.map((role) => {
                        const Icon = roleIcons[role.value] || User;
                        const isSelected = data.main_role === role.value;

                        return (
                            <Card
                                key={role.value}
                                className={`cursor-pointer transition-all hover:border-primary/50 ${
                                    isSelected ? '' : 'border-border'
                                }`}
                                style={isSelected ? { borderColor: role.borderColor, backgroundColor: 'rgba(0,0,0,0.02)' } : undefined}
                                onClick={() => setData('main_role', role.value)}
                            >
                                <div className="flex items-center gap-3 p-3">
                                    <div className={`rounded-lg p-2 ${isSelected ? `${role.color} text-white` : 'bg-muted dark:bg-muted/50'}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{role.label}</div>
                                        <div className="text-xs text-muted-foreground">{role.description}</div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <InputError message={errors.main_role} />

                <Button
                    type="submit"
                    className="h-10 w-full rounded-lg transition-all active:scale-[0.98]"
                    disabled={processing || !data.main_role}
                >
                    {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                    Continue
                </Button>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
