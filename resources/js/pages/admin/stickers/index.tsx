import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Ticket, Printer, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vehicle Stickers', href: '#' },
];

export default function Stickers() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicle Stickers" />
            <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vehicle Stickers</h1>
                    <p className="text-muted-foreground text-base">Manage and issue university vehicle access stickers.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center md:col-span-3">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Tag className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="mb-2">Sticker Management Coming Soon</CardTitle>
                        <CardDescription className="max-w-sm mx-auto mb-6">
                            The sticker issuance and tracking module is being integrated into the vehicle registry.
                        </CardDescription>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button variant="outline" className="gap-2" disabled>
                                <Printer className="h-4 w-4" /> Batch Print
                            </Button>
                            <Button variant="outline" className="gap-2" disabled>
                                <ShieldCheck className="h-4 w-4" /> Verify Sticker
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
