import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Users, Wrench, User } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

interface RoleType {
    value: number;
    name: string;
    description: string;
}

interface RegisterRoleTypeProps {
    roleTypes: RoleType[];
    savedRoleTypeId?: number;
}

interface RegisterRoleTypeForm {
    [key: string]: number | undefined;
    role_type_id?: number;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Guardian: Users,
    'Service Provider': Wrench,
    Visitor: User,
};

export default function RegisterRoleType({ roleTypes, savedRoleTypeId }: RegisterRoleTypeProps) {
    const { data, setData, post, processing, errors } = useForm<RegisterRoleTypeForm>({
        role_type_id: savedRoleTypeId,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.store-role-type'), {
            onSuccess: () => toast.success('Type selected.'),
            onError: () => toast.error('Please select a valid type.'),
        });
    };

    return (
        <AuthLayout title="Select Your Type" description="What type of stakeholder are you?" backHref={route('register.back')}>
            <Head title="Stakeholder Type" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid grid-cols-1 gap-4">
                    {roleTypes.map((type) => {
                        const Icon = typeIcons[type.name] || User;
                        const isSelected = data.role_type_id === type.value;

                        return (
                            <Card
                                key={type.value}
                                className={`cursor-pointer transition-all hover:border-primary/50 ${
                                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                }`}
                                onClick={() => setData('role_type_id', type.value)}
                            >
                                <div className="flex items-center gap-3 p-3">
                                    <div className={`rounded-lg p-2 ${isSelected ? 'bg-amber-600 text-white' : 'bg-muted dark:bg-muted/50'}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{type.name}</div>
                                        <div className="text-xs text-muted-foreground">{type.description}</div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <InputError message={errors.role_type_id} />

                <Button
                    type="submit"
                    className="h-12 w-full text-base transition-transform active:scale-[0.98]"
                    disabled={processing || !data.role_type_id}
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
