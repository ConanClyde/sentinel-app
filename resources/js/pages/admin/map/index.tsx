import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon, Navigation, Info, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Campus Map', href: '#' },
];

export default function CampusMap() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campus Map" />
            <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1.5 text-center items-center py-8">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                        <MapIcon className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Interactive Campus Map</h1>
                    <p className="text-muted-foreground text-lg max-w-lg mt-2">
                        View real-time security zones, entry points, and facility locations.
                    </p>
                </div>

                <Card className="border-dashed flex flex-col items-center justify-center p-20 text-center bg-muted/20 overflow-hidden relative min-h-[400px]">
                    <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                         <div className="w-[800px] h-[800px] border-[100px] border-primary rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <Navigation className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4 animate-bounce" />
                        <CardTitle className="text-2xl mb-3">Map Engine Initializing</CardTitle>
                        <CardDescription className="max-w-md mx-auto mb-8 text-neutral-500">
                            We are integrating the campus geospatial data into an interactive Leaflet-powered interface.
                        </CardDescription>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button className="h-11 px-8 rounded-full" disabled>
                                Open Fullscreen
                            </Button>
                            <Button variant="outline" className="h-11 px-8 rounded-full gap-2" disabled>
                                <Info className="h-4 w-4" /> Marker Legend
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
