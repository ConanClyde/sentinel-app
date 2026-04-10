import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Radar, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patrol Monitor', href: '#' },
];

export default function PatrolMonitor() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Live Patrol Monitor" />
            <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live Patrol Monitor</h1>
                    </div>
                    <p className="text-muted-foreground text-base">Real-time status of campus security personnel and patrol routes.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="md:col-span-3 min-h-[500px] border-none bg-slate-950 text-slate-400 relative overflow-hidden flex flex-col items-center justify-center">
                         {/* Radar grid effect */}
                        <div className="absolute inset-0 opacity-10" 
                             style={{ 
                                backgroundImage: 'linear-gradient(#4a5568 1px, transparent 1px), linear-gradient(90deg, #4a5568 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                             }} 
                        />
                        
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <Radar className="h-20 w-20 text-blue-500 animate-pulse" />
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-white tracking-widest uppercase">System Offline</h2>
                                <p className="text-sm font-mono opacity-60">WAITING FOR BIOMETRIC SCANNER LINK...</p>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-6 h-auto flex flex-col items-center transition-all hover:scale-105" disabled>
                                <span className="text-xs font-black tracking-widest uppercase opacity-70 mb-1">Manual Override</span>
                                <span className="font-bold">Connect to Feed</span>
                            </Button>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <Card className="border-muted/40 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-green-500" />
                                    Active Units
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0 / 12</div>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">No units currently on patrol</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-muted/40 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-orange-500" />
                                    Alert Level
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Normal</div>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">Green sector status</p>
                            </CardContent>
                        </Card>

                        <div className="rounded-xl border border-dashed p-4 flex flex-col items-center text-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Syncing Data...</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
