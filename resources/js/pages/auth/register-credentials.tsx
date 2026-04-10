import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';

interface CredentialsForm {
    [key: string]: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface RegisterCredentialsProps {
    savedEmail?: string;
}

export default function RegisterCredentials({ savedEmail }: RegisterCredentialsProps) {
    const { data, setData, post, processing, errors } = useForm<CredentialsForm>({
        email: savedEmail || '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.store-credentials'));
    };

    const passwordStrength = () => {
        const password = data.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 1) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (strength === 2) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (strength === 3) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const { strength, label, color } = passwordStrength();

    return (
        <AuthLayout title="Create an account" description="Step 4 of 5: Set your credentials" backHref={route('register.back')} progress={80}>
            <Head title="Register - Credentials" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="juan@example.com"
                            className="h-12 text-base"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={2}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Enter password"
                            className="h-12 text-base"
                        />
                        {data.password && (
                            <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-gray-200">
                                    <div
                                        className={`h-full rounded-full transition-all ${color}`}
                                        style={{ width: `${strength}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">{label}</span>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Must be at least 8 characters with 1 uppercase letter and 1 number.
                        </p>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="h-12 text-base"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 h-12 w-full text-base transition-transform active:scale-[0.98]" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Continue
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={5}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
