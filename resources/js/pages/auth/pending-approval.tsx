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
            backHref={route('home')}
        >
            <Head title="Pending Approval" />
            
            <div className="flex flex-col gap-6 mt-4">
                <div className="flex items-center justify-center rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/10 dark:text-yellow-500">
                    <Clock className="mr-2 h-4 w-4 shrink-0" />
                    <span className="font-medium">Pending administrator action</span>
                </div>

                <Button asChild variant="secondary" className="w-full h-10">
                    <Link href={route('home')}>
                        Return to Home
                    </Link>
                </Button>
            </div>
        </AuthLayout>
    );
}
