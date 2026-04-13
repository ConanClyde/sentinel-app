import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';

import AuthLayout from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function PendingApproval() {
    return (
        <AuthLayout 
            title="Account Under Review" 
            description="Your registration has been successfully submitted. We are currently reviewing your details and you will receive an email notification once an administrator approves your account." 
            backHref={route('welcome')}
            showHomeIcon
        >
            <Head title="Pending Approval" />

            <div className="flex flex-col gap-8 py-4">
                <div className="flex flex-col gap-3 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Clock className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Registration Received</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Your application is currently being reviewed by our administration team.
                    </p>
                </div>

                <div className="grid gap-4">
                    <Button asChild variant="outline" className="h-11 font-medium">
                        <Link href={route('welcome')}>
                            Return to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
