import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: route('password.edit'),
    },
];

export default function Password() {
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-12">
                    <div className="flex flex-col gap-8">
                        <HeadingSmall title="Security Protocol" description="Update your authentication credentials. Use a high-entropy password to ensure maximal session security." />

                        <form onSubmit={updatePassword} className="flex flex-col gap-8">
                            <Card className="border-muted/40 border-[1.5px] overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="grid divide-y divide-muted/20">
                                        {/* Current Authentication */}
                                        <div className="p-8 bg-muted/5">
                                            <div className="grid gap-3 max-w-md">
                                                <Label htmlFor="current_password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                    Current Authentication Factor
                                                </Label>
                                                <PasswordInput
                                                    id="current_password"
                                                    ref={currentPasswordInput}
                                                    value={data.current_password}
                                                    onChange={(e) => setData('current_password', e.target.value)}
                                                    className="h-12 bg-background border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl"
                                                    autoComplete="current-password"
                                                    placeholder="Confirm existing password"
                                                />
                                                <InputError message={errors.current_password} />
                                            </div>
                                        </div>

                                        {/* New Credentials */}
                                        <div className="p-8 space-y-8">
                                            <div className="grid sm:grid-cols-2 gap-8">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                        New Security Key
                                                    </Label>
                                                    <PasswordInput
                                                        id="password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className="h-12 bg-muted/20 border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl"
                                                        autoComplete="new-password"
                                                        placeholder="Create new password"
                                                    />
                                                    <PasswordStrengthIndicator password={data.password} className="mt-1" />
                                                    <InputError message={errors.password} />
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="password_confirmation" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                        Validate Key
                                                    </Label>
                                                    <PasswordInput
                                                        id="password_confirmation"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className="h-12 bg-muted/20 border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl"
                                                        autoComplete="new-password"
                                                        placeholder="Confirm new password"
                                                    />
                                                    <InputError message={errors.password_confirmation} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-between p-1">
                                <Button disabled={processing} className="h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2">
                                    Finalize Key Rotation
                                    {recentlySuccessful && (
                                        <span className="ml-2 h-2 w-2 rounded-full bg-primary-foreground animate-ping" />
                                    )}
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-green-500" />
                                        Credentials Rotated
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
