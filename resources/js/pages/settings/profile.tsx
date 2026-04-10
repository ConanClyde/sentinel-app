import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

interface NameExtension {
    value: string;
    label: string;
}

interface ProfileProps {
    mustVerifyEmail: boolean;
    nameExtensions: NameExtension[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: route('profile.edit'),
    },
];

export default function Profile({ mustVerifyEmail, nameExtensions }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful, transform } = useForm({
        first_name: auth.user.first_name,
        middle_name: auth.user.middle_name || '',
        surname: auth.user.surname,
        name_extension: auth.user.name_extension || '',
        email: auth.user.email,
    });

    // Transform 'none' to empty string before submitting
    transform((formData) => ({
        ...formData,
        name_extension: formData.name_extension === 'none' ? '' : formData.name_extension,
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First name</Label>

                                <Input
                                    id="first_name"
                                    className="mt-1 block w-full"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    required
                                    autoComplete="given-name"
                                    placeholder="First name"
                                />

                                <InputError className="mt-2" message={errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="surname">Surname</Label>

                                <Input
                                    id="surname"
                                    className="mt-1 block w-full"
                                    value={data.surname}
                                    onChange={(e) => setData('surname', e.target.value)}
                                    required
                                    autoComplete="family-name"
                                    placeholder="Surname"
                                />

                                <InputError className="mt-2" message={errors.surname} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="middle_name">
                                    Middle name <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>

                                <Input
                                    id="middle_name"
                                    className="mt-1 block w-full"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    autoComplete="additional-name"
                                    placeholder="Middle name"
                                />

                                <InputError className="mt-2" message={errors.middle_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name_extension">
                                    Name extension <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>

                                <Select value={data.name_extension || undefined} onValueChange={(value) => setData('name_extension', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {nameExtensions.map((ext) => (
                                            <SelectItem key={ext.value} value={ext.value}>
                                                {ext.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <InputError className="mt-2" message={errors.name_extension} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
