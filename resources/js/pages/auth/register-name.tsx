import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

interface NameExtension {
    value: string;
    label: string;
}

interface SavedName {
    first_name?: string;
    middle_name?: string;
    surname?: string;
    name_extension?: string;
}

interface RegisterNameProps {
    nameExtensions: NameExtension[];
    selectedRole: string;
    savedName?: SavedName;
}

interface RegisterNameForm {
    [key: string]: string | undefined;
    first_name: string;
    middle_name: string;
    surname: string;
    name_extension: string;
}

export default function RegisterName({ nameExtensions, selectedRole, savedName }: RegisterNameProps) {
    const { data, setData, post, processing, errors, transform } = useForm<RegisterNameForm>({
        first_name: savedName?.first_name || '',
        middle_name: savedName?.middle_name || '',
        surname: savedName?.surname || '',
        name_extension: savedName?.name_extension || '',
    });

    transform((formData) => ({
        ...formData,
        name_extension: formData.name_extension === 'none' ? '' : formData.name_extension,
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.store-name'), {
            onSuccess: () => toast.success('Name saved.'),
            onError: () => toast.error('Please fix the errors in your name fields.'),
        });
    };

    const roleLabel = selectedRole === 'Student' ? 'Student' : selectedRole === 'Staff' ? 'Staff' : 'Stakeholder';

    return (
        <AuthLayout title="Create an account" description={`Step 1 of 5: Enter your name (${roleLabel})`} backHref={route('register.back')} progress={20}>
            <Head title="Register - Name" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="first_name">First name</Label>
                        <Input
                            id="first_name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="given-name"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            disabled={processing}
                            placeholder="Juan"
                            className="h-10"
                        />
                        <InputError message={errors.first_name} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="middle_name">
                            Middle name <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                            id="middle_name"
                            type="text"
                            tabIndex={2}
                            autoComplete="additional-name"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            disabled={processing}
                            placeholder="Santos"
                            className="h-10"
                        />
                        <InputError message={errors.middle_name} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="surname">Surname</Label>
                        <Input
                            id="surname"
                            type="text"
                            required
                            tabIndex={3}
                            autoComplete="family-name"
                            value={data.surname}
                            onChange={(e) => setData('surname', e.target.value)}
                            disabled={processing}
                            placeholder="Dela Cruz"
                            className="h-10"
                        />
                        <InputError message={errors.surname} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name_extension">
                            Name extension <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Select value={data.name_extension || undefined} onValueChange={(value) => setData('name_extension', value)} disabled={processing}>
                            <SelectTrigger className="h-10" tabIndex={4}>
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                <SelectItem value="none" className="pl-3">None</SelectItem>
                                {nameExtensions.map((ext) => (
                                    <SelectItem key={ext.value} value={ext.value} className="pl-3">
                                        {ext.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.name_extension} />
                    </div>

                    <Button type="submit" className="mt-2 h-10 w-full rounded-lg transition-all active:scale-[0.98]" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Continue
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
