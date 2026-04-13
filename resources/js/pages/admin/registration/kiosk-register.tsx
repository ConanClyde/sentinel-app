import { Head, useForm, router } from '@inertiajs/react';
import { LoaderCircle, User, GraduationCap, Briefcase, Users } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';
import { Alert } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MainRole {
    value: string;
    label: string;
    description: string;
    color: string;
    borderColor: string;
}

interface KioskRegisterProps {
    mainRoles: MainRole[];
}

interface KioskForm {
    [key: string]: string;
    main_role: string;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    student: GraduationCap,
    staff: Briefcase,
    stakeholder: Users,
};

export default function KioskRegister({ mainRoles }: KioskRegisterProps) {
    const { data, setData, post, processing, errors } = useForm<KioskForm>({
        main_role: '',
    });

    const handleSelect = (role: string) => {
        const slug = role.toLowerCase();
        router.get(route('admin.registration.byRole', { role: slug }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.main_role) {
            toast.error('Please select a role.');
            return;
        }

        handleSelect(data.main_role);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
            <Head title="Kiosk Registration" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Campus Registration</h1>
                    <p className="text-muted-foreground text-sm mt-2">Select your role to get started</p>
                </div>

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
                                    <div className="flex items-center gap-3 p-4">
                                        <div className={`rounded-lg p-3 ${isSelected ? `${role.color} text-white` : 'bg-muted dark:bg-muted/50'}`}>
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">{role.label}</div>
                                            <div className="text-sm text-muted-foreground">{role.description}</div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <InputError message={errors.main_role} />

                    <Button
                        type="submit"
                        className="h-12 w-full rounded-lg text-lg transition-all active:scale-[0.98]"
                        disabled={processing || !data.main_role}
                    >
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                        Continue
                    </Button>
                </form>
            </div>
        </div>
    );
}
