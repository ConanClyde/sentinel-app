import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '#' },
];

export default function Reports() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Reports" />
            <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Reports</h1>
                    <p className="text-muted-foreground text-base">Generate and view campus security and registration analytics.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center md:col-span-3">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <BarChart3 className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="mb-2">Reporting Module Coming Soon</CardTitle>
                        <CardDescription className="max-w-sm mx-auto mb-6">
                            We are currently building the comprehensive reporting and analytics engine for Sentinel.
                        </CardDescription>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button variant="outline" className="gap-2" disabled>
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                            <Button variant="outline" className="gap-2" disabled>
                                <Calendar className="h-4 w-4" /> Schedule Report
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
