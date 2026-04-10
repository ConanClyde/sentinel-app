import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type NavItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Search, 
    ChevronRight, 
    Filter, 
    Clock, 
    User, 
    FileText,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface PendingRegistration {
    id: number;
    first_name: string;
    surname: string;
    email: string;
    role: string;
    created_at: string;
    role_type?: {
        name: string;
    };
}

interface Props {
    pendingRegistrations: PendingRegistration[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pending Approvals',
        href: route('admin.pending-registrations.index'),
    },
];

export default function PendingRegistrationsIndex({ pendingRegistrations }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRegistrations = pendingRegistrations.filter(reg => {
        const fullName = `${reg.first_name} ${reg.surname}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || 
               reg.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Approvals" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Header & Search */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Link href={route('dashboard')} className="hover:text-foreground transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <span className="text-xs font-bold uppercase tracking-widest">Admin Console</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pending Approvals</h1>
                        <p className="text-muted-foreground">Review and verify new campus registration requests.</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name or email..." 
                                className="pl-10 h-12 bg-background border-muted/40"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-12 w-12 border-muted/40">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded-lg border border-muted/20">
                     <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none px-2 py-0">
                            {pendingRegistrations.length}
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Total Pending</span>
                     </div>
                </div>

                {/* List Container */}
                <div className="flex flex-col gap-3">
                    {filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map((reg) => (
                            <Link 
                                key={reg.id} 
                                href={route('admin.pending-registrations.show', { id: reg.id })}
                                className="group block transform transition-all active:scale-[0.98]"
                            >
                                <Card className="border-muted/40 shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
                                    <CardContent className="p-0">
                                        <div className="flex items-center p-4 gap-4">
                                            {/* Avatar/Icon Placeholder */}
                                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center shrink-0 border border-muted/20">
                                                <User className="h-6 w-6 text-muted-foreground" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground text-lg truncate tracking-tight">
                                                        {reg.first_name} {reg.surname}
                                                    </span>
                                                    <Badge variant="outline" className="bg-background border-muted/50 text-[10px] uppercase font-black tracking-tighter">
                                                        {reg.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                    <span className="truncate">{reg.email}</span>
                                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(reg.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Indicator */}
                                            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors pr-2">
                                                <span className="text-xs font-bold uppercase hidden md:inline tracking-widest">Verify</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                        
                                        {/* Bottom Progress/Bar */}
                                        <div className="h-1 w-full bg-muted/20">
                                            <div className="h-full bg-orange-500 w-[15%]" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/5">
                            <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No matching requests</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                We couldn't find any pending registrations matching your search criteria.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-6 border-muted/50"
                                onClick={() => setSearchQuery('')}
                            >
                                Clear search
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer/Help */}
                <div className="mt-8 flex flex-col items-center gap-4 py-8 border-t border-muted/20">
                    <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />
                        Need help with the approval process? 
                        <Link href="#" className="text-primary hover:underline">View Guidelines</Link>
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
