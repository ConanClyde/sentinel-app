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
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ShieldCheck } from 'lucide-react';
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
                <div className="space-y-12">
                    <div className="flex flex-col gap-8">
                        <HeadingSmall title="Personal Specification" description="Verify and update your legal names. These details are used for vehicle authorization matching." />

                        <form onSubmit={submit} className="flex flex-col gap-8">
                            <Card className="border-muted/40 border-[1.5px] overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="grid divide-y divide-muted/20">
                                        {/* Primary Identity Section */}
                                        <div className="p-8 space-y-8">
                                            <div className="grid sm:grid-cols-2 gap-8">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legal First Name</Label>
                                                    <Input
                                                        id="first_name"
                                                        className="h-12 bg-muted/20 border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl"
                                                        value={data.first_name}
                                                        onChange={(e) => setData('first_name', e.target.value)}
                                                        required
                                                        autoComplete="given-name"
                                                        placeholder="e.g. Juan"
                                                    />
                                                    <InputError message={errors.first_name} />
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="surname" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legal Surname</Label>
                                                    <Input
                                                        id="surname"
                                                        className="h-12 bg-muted/20 border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl"
                                                        value={data.surname}
                                                        onChange={(e) => setData('surname', e.target.value)}
                                                        required
                                                        autoComplete="family-name"
                                                        placeholder="e.g. Dela Cruz"
                                                    />
                                                    <InputError message={errors.surname} />
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-8">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="middle_name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        Middle Name <span className="text-muted-foreground/50 lowercase italic">(optional)</span>
                                                    </Label>
                                                    <Input
                                                        id="middle_name"
                                                        className="h-12 bg-muted/20 border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl text-muted-foreground focus:text-foreground"
                                                        value={data.middle_name}
                                                        onChange={(e) => setData('middle_name', e.target.value)}
                                                        autoComplete="additional-name"
                                                        placeholder="Middle name"
                                                    />
                                                    <InputError message={errors.middle_name} />
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="name_extension" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        Name Suffix <span className="text-muted-foreground/50 lowercase italic">(optional)</span>
                                                    </Label>
                                                    <Select value={data.name_extension || undefined} onValueChange={(value) => setData('name_extension', value)}>
                                                        <SelectTrigger className="h-12 bg-muted/20 border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl">
                                                            <SelectValue placeholder="No suffix" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-muted/40">
                                                            <SelectItem value="none" className="font-bold">None</SelectItem>
                                                            {nameExtensions.map((ext) => (
                                                                <SelectItem key={ext.value} value={ext.value} className="font-bold">
                                                                    {ext.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.name_extension} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Communication Section */}
                                        <div className="p-8 bg-muted/5 space-y-8">
                                            <div className="grid gap-3 max-w-md">
                                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Communication Channel (Email)</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="h-12 bg-background border-muted/60 focus:border-primary/50 focus:ring-primary/20 font-bold rounded-xl"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    required
                                                    autoComplete="username"
                                                    placeholder="primary@email.com"
                                                />
                                                <InputError message={errors.email} />

                                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                                                        <AlertCircle className="h-4 w-4 text-orange-600" />
                                                        <p className="text-xs font-bold text-orange-700">
                                                            Email unverified. 
                                                            <Link
                                                                href={route('verification.send')}
                                                                method="post"
                                                                as="button"
                                                                className="ml-1 underline hover:text-orange-900 transition-colors"
                                                            >
                                                                Send verification link
                                                            </Link>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-between p-1">
                                <Button disabled={processing} className="h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2">
                                    Commit Identity Updates
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
                                        Update Confirmed
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
