import { Head, useForm, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef } from 'react';

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
    savedPassword?: string;
    savedPasswordConfirmation?: string;
}

export default function RegisterCredentials({ savedEmail, savedPassword, savedPasswordConfirmation }: RegisterCredentialsProps) {
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data, setData, post, processing, errors } = useForm<CredentialsForm>({
        email: savedEmail || '',
        password: savedPassword || '',
        password_confirmation: savedPasswordConfirmation || '',
    });

    // Sync from session when navigating back
    useEffect(() => {
        if (savedEmail) setData('email', savedEmail);
        if (savedPassword) setData('password', savedPassword);
        if (savedPasswordConfirmation) setData('password_confirmation', savedPasswordConfirmation);
    }, [savedEmail, savedPassword, savedPasswordConfirmation]);

    // Save credentials to session when user types (debounced)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setData('email', email);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        if (email && email.includes('@')) {
            saveTimeout.current = setTimeout(() => {
                router.post(route('register.save-credentials'), { email }, { replace: true });
            }, 1000);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setData('password', password);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        if (password.length >= 8) {
            saveTimeout.current = setTimeout(() => {
                router.post(route('register.save-credentials'), { password }, { replace: true });
            }, 1000);
        }
    };

    const handlePasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password_confirmation = e.target.value;
        setData('password_confirmation', password_confirmation);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        if (password_confirmation) {
            saveTimeout.current = setTimeout(() => {
                router.post(route('register.save-credentials'), { password_confirmation }, { replace: true });
            }, 1000);
        }
    };

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
                            onChange={handleEmailChange}
                            disabled={processing}
                            placeholder="juan@example.com"
                            className="h-10"
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
                            onChange={handlePasswordChange}
                            disabled={processing}
                            placeholder="Enter password"
                            className="h-10"
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
                            onChange={handlePasswordConfirmationChange}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="h-10"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 h-10 w-full rounded-lg transition-all active:scale-[0.98]" tabIndex={4} disabled={processing}>
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
