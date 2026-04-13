// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'), {
            onSuccess: () => {},
            onError: (errors) => {
                if (errors.email) {
                    toast.error(errors.email);
                } else {
                    toast.error('Failed to send reset code. Please try again.');
                }
            },
        });
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset code" backHref={route('welcome')} showHomeIcon>
            <Head title="Forgot password" />

            <div className="flex flex-col gap-6">
                <form onSubmit={submit}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="juan@example.com"
                            className="h-10"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <Button className="mt-6 h-10 w-full rounded-lg transition-all active:scale-[0.98]" disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Send reset code
                    </Button>
                </form>

                <div className="text-muted-foreground text-center text-sm">
                    <span>Or, return to </span>
                    <TextLink href={route('login')}>log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
