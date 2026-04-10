import { Head, router } from '@inertiajs/react';

import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

// This page is now just a redirect to the role selection page
export default function Register() {
    return (
        <AuthLayout title="Register" description="Create your account">
            <Head title="Register" />
            <div className="text-center">
                <p className="text-muted-foreground">Redirecting to registration...</p>
            </div>
            <div className="text-muted-foreground text-center text-sm mt-4">
                Already have an account?{' '}
                <TextLink href={route('login')}>
                    Log in
                </TextLink>
            </div>
        </AuthLayout>
    );
}
