import { Head, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface VerifyForm {
    [key: string]: string;
    email: string;
    code: string;
}

interface PageProps {
    email: string;
    debug_code?: string;
}

export default function RegisterVerify() {
    const { email, debug_code } = usePage<{ email: string; debug_code?: string }>().props;
    const [resending, setResending] = useState(false);

    const { data, setData, post, processing, errors } = useForm<VerifyForm>({
        email: email || '',
        code: '',
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value[0];
        }

        const newCode = data.code.split('');
        newCode[index] = value;
        const updatedCode = newCode.join('');
        setData('code', updatedCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !data.code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            setData('code', pastedData.padEnd(6, '').slice(0, 6));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.verify-code'), {
            onSuccess: () => {},
            onError: (errors) => {
                if (errors.code) {
                    toast.error(errors.code);
                } else {
                    toast.error('Invalid or expired code. Please try again.');
                }
            },
        });
    };

    return (
        <AuthLayout title="Verify your email" description="Step 5 of 5: Enter the verification code" backHref={route('register.back')} progress={100}>
            <Head title="Verify Email" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="flex flex-col gap-6">
                    <div className="text-center">
                        <p className="text-muted-foreground text-sm">
                            We sent a 6-digit code to <span className="font-medium text-foreground">{data.email}</span>
                        </p>
                    </div>

                    {debug_code && (
                        <div className="rounded-lg bg-yellow-100 p-3 text-center text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Debug mode: Your code is <span className="font-mono font-bold">{debug_code}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="code" className="sr-only">Verification code</Label>
                        <div className="flex justify-center gap-2" onPaste={handlePaste}>
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <Input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d"
                                    maxLength={1}
                                    className="h-14 w-12 text-center text-2xl font-semibold"
                                    value={data.code[index] || ''}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    disabled={processing}
                                    tabIndex={index + 1}
                                />
                            ))}
                        </div>
                        <InputError message={errors.code} className="text-center" />
                    </div>

                    <Button type="submit" className="h-10 w-full rounded-lg transition-all active:scale-[0.98]" disabled={processing || data.code.length !== 6}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                        Verify
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Didn't receive the code? </span>
                        <button
                            type="button"
                            className="text-primary underline-offset-4 hover:underline disabled:opacity-50"
                            onClick={() => {
                                setResending(true);
                                router.post(route('register.resend-code'), { email: data.email }, {
                                    preserveScroll: true,
                                    onSuccess: () => {},
                                    onError: () => toast.error('Failed to resend code. Please try again.'),
                                    onFinish: () => setResending(false),
                                });
                            }}
                            disabled={processing || resending}
                        >
                            {resending && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            {resending ? 'Sending...' : 'Resend code'}
                        </button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
