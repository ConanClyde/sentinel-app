import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Lock, ServerCrash, ZapOff, Activity } from 'lucide-react';

export default function ErrorPage({ status }: { status: number }) {
    const titles: Record<number, string> = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
        429: '429: Too Many Requests',
    };
    const title = titles[status] || 'An Error Occurred';

    const descriptions: Record<number, string> = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
        429: 'You have been placing too many requests. Please wait a few minutes before trying again.',
    };
    const description = descriptions[status] || 'An unexpected error occurred.';

    const icons: Record<number, any> = {
        503: ServerCrash,
        500: ZapOff,
        404: FileQuestion,
        403: Lock,
        429: Activity,
    };
    const Icon = icons[status] || FileQuestion;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
            <Head title={title} />
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="text-center pt-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                    <p className="text-muted-foreground mb-8">
                        {description}
                    </p>
                    <div className="flex flex-col gap-4">
                        <Button asChild className="w-full h-11">
                            <Link href={route('dashboard')}>
                                Return
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
