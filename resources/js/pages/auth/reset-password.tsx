import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordForm {
    [key: string]: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword() {
    const { data, setData, post, processing, errors } = useForm<ResetPasswordForm>({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onSuccess: () => {},
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Technical error occurred while resetting password.');
            },
        });
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
        <AuthLayout title="Reset password" description="Step 3 of 3: Enter your new password" backHref={route('login')}>
            <Head title="Reset password" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="h-10"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            autoFocus
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
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="h-10"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 h-10 w-full rounded-lg transition-all active:scale-[0.98]" disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
