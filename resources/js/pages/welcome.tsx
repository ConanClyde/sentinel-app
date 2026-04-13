import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Shield,
    Car, 
    Users, 
    MapPin,
    QrCode,
    Camera,
    BarChart3,
    ShieldCheck,
    Menu,
    X,
    ChevronDown,
    CheckCircle,
    ArrowRight,
    Mail,
    Building2
} from 'lucide-react';
import { useEffect, useState } from 'react';

declare global {
    interface Window {
        Echo: any;
    }
}

export default function Welcome({ initialStats }: { initialStats: { users: number; vehicles: number; violations: number } }) {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        users: initialStats.users,
        vehicles: initialStats.vehicles,
        violations: initialStats.violations
    });

    // Real-time statistics via Laravel Reverb
    useEffect(() => {
        // Listen for user creation events
        window.Echo.channel('users')
            .listen('.user.created', () => {
                setStats(prev => ({ ...prev, users: prev.users + 1 }));
            });

        // Listen for vehicle creation events
        window.Echo.channel('vehicles')
            .listen('.vehicle.created', () => {
                setStats(prev => ({ ...prev, vehicles: prev.vehicles + 1 }));
            });

        // Listen for violation status updates
        window.Echo.channel('reports')
            .listen('.report.status.updated', (data: any) => {
                if (data.status === 'approved') {
                    setStats(prev => ({ ...prev, violations: prev.violations + 1 }));
                }
            });

        // Cleanup
        return () => {
            window.Echo.leave('users');
            window.Echo.leave('vehicles');
            window.Echo.leave('reports');
        };
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans antialiased">
            <Head title="MLUC Sentinel - Digital Parking & Security Management" />

            {/* --- NAVIGATION BAR --- */}
            <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
                    <Link href="#top" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-lg font-semibold">MLUC Sentinel</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <AppearanceToggleDropdown />
                        {auth.user ? (
                            <Button asChild size="sm" className="font-semibold rounded-lg shadow-sm">
                                <Link href={route('dashboard')}>Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm" className="font-semibold rounded-lg shadow-sm">
                                <Link href={route('login')}>Sign In</Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden h-9 w-9 flex items-center justify-center"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-4 space-y-2">
                            <AppearanceToggleDropdown className="w-full" />
                            {auth.user ? (
                                <Button asChild className="w-full justify-start gap-3 h-10 rounded-lg">
                                    <Link href={route('dashboard')} onClick={() => setMobileMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild className="w-full justify-start gap-3 h-10 rounded-lg">
                                    <Link href={route('login')} onClick={() => setMobileMenuOpen(false)}>
                                        Sign In
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <main id="top">
                {/* --- HERO SECTION --- */}
                <section className="py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6">
                    <div className="mx-auto max-w-7xl text-center">
                        <Badge variant="outline" className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg">
                            <span className="h-2 w-2 rounded-full bg-red-500 mr-2 inline-block animate-pulse" />
                            Parking Management Platform
                        </Badge>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 px-2">
                            Campus parking that works like a{' '}
                            <span className="text-primary">Sentinel</span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
                            Comprehensive digital platform for parking permits, violation reporting with QR technology, 
                            evidence-based enforcement, and real-time security monitoring.
                        </p>

                        <Button asChild size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto">
                            <Link href={route('register')}>Get Started</Link>
                        </Button>

                        <p className="text-xs sm:text-sm text-muted-foreground mt-4 max-w-2xl mx-auto px-4">
                            Join MLUC Sentinel as a student, staff member, stakeholder, or security personnel and start managing your campus parking digitally.
                        </p>

                        {/* Real-time Statistics */}
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-12 sm:mt-16 max-w-4xl mx-auto px-2">
                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 shadow-sm transition-all hover:shadow-md cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
                                        Registered Users
                                    </CardTitle>
                                    <div className="rounded-lg p-2 bg-primary/10 dark:bg-primary/20">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.users}</div>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Active accounts</p>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 shadow-sm transition-all hover:shadow-md cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                                        Registered Vehicles
                                    </CardTitle>
                                    <div className="rounded-lg p-2 bg-green-500/10 dark:bg-green-500/20">
                                        <Car className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.vehicles}</div>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Active permits</p>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 shadow-sm transition-all hover:shadow-md cursor-pointer">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                        Approved Violations
                                    </CardTitle>
                                    <div className="rounded-lg p-2 bg-purple-500/10 dark:bg-purple-500/20">
                                        <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.violations}</div>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Processed reports</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* --- BENEFITS SECTION --- */}
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted/30">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-8 sm:mb-12 px-2">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Why MLUC Sentinel?</h2>
                            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                                Traditional campus management relies on manual processes. MLUC Sentinel transforms operations with a centralized digital platform.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 px-2">
                            {/* Benefit 1 */}
                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 shadow-sm transition-all hover:shadow-md">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary pr-2">
                                        Digital Parking Permit System
                                    </CardTitle>
                                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                                        Eliminate paper-based parking permits with digital vehicle registration, automatic QR-enabled sticker generation, 
                                        and color-coded identification—streamlining campus parking management from registration to enforcement.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Benefit 2 */}
                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 shadow-sm transition-all hover:shadow-md">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 pr-2">
                                        Smart Violation Reporting System
                                    </CardTitle>
                                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                        <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                                        Report violations instantly by scanning QR codes on parking stickers. Upload photo evidence, pin exact locations 
                                        on the interactive campus map, and automatically route reports to the appropriate administrators—transforming 
                                        violation management from manual to digital.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Benefit 3 */}
                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 shadow-sm transition-all hover:shadow-md">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 pr-2">
                                        Security Patrol Tracking
                                    </CardTitle>
                                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                                        Monitor security patrols with QR-based check-ins at strategic locations, track coverage, and ensure 
                                        comprehensive campus security.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Benefit 4 */}
                            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/10 shadow-sm transition-all hover:shadow-md">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 pr-2">
                                        Transparent Management
                                    </CardTitle>
                                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                                        Digital tracking ensures consistent enforcement, automatic admin assignment based on violator type, 
                                        and complete audit trails.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* --- FEATURES SECTION --- */}
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-8 sm:mb-12 px-2">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Complete Campus Management</h2>
                            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                                Everything you need to manage parking, violations, and security in one comprehensive platform.
                            </p>
                        </div>

                        {/* Feature Block 1 - For Students, Staff & Stakeholders */}
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02] mb-6 sm:mb-8 mx-2 sm:mx-0">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2 sm:gap-3">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    For Students, Staff & Stakeholders
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Manage your vehicles and parking permits digitally.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Online Registration</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Create your account online and submit your registration for administrator approval. 
                                            Provide your personal information and vehicle details to get started with digital parking management.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Vehicle Management</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            View your registered vehicles, check active sticker status, and manage your vehicle information 
                                            through your personalized dashboard with real-time updates.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Sticker Requests</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Submit vehicle requests for new parking permits or replacement stickers through your dashboard. 
                                            Track request status and receive email notifications when approved.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Violation Reporting</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Report parking violations by scanning QR codes on vehicle stickers. Upload photo evidence, 
                                            select violation types, and pin locations on the interactive campus map.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Campus Map Access</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Access the interactive campus map to view parking zones, transit routes, and location markers 
                                            for better navigation around campus.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Color-Coded QR Stickers</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Receive unique color-coded parking stickers with QR codes linked to your vehicle registration 
                                            for instant verification and streamlined enforcement.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature Block 2 - For Security Personnel & Reporters */}
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02] mb-6 sm:mb-8 mx-2 sm:mx-0">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2 sm:gap-3">
                                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                    For Security Personnel & Reporters
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Enforce parking regulations and conduct campus patrols.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">QR Code Scanning</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Scan QR codes on parking stickers using your mobile device to instantly retrieve vehicle 
                                            information and owner details for violation reporting.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Violation Reports</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            File detailed violation reports with photo evidence, select from predefined violation types, 
                                            and pin exact locations on the interactive campus map.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">My Reports Tracking</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Track all your submitted reports with status indicators (pending, approved, rejected). 
                                            View report history and administrator feedback on your submissions.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Patrol Check-In System</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Scan QR codes at strategic patrol checkpoints across campus to log your patrol activities, 
                                            track coverage areas, and maintain comprehensive patrol records.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Patrol History</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Access your complete patrol history with timestamps, locations, and coverage data. 
                                            Monitor your patrol performance and shift activities.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">My Violations</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            View violations filed against your own vehicles (for Security Personnel with registered vehicles). 
                                            Track violation status and resolution.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature Block 3 - For Administration */}
                        <Card className="border-muted/40 shadow-sm bg-primary/[0.02] mx-2 sm:mx-0">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-sm sm:text-base lg:text-lg flex items-center gap-2 sm:gap-3">
                                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                    For Administration
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Complete oversight of parking operations and enforcement.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Dashboard Analytics</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Real-time dashboard with statistics on violations, vehicles, sticker requests, patrol activities, 
                                            and user counts (students, staff, stakeholders, security personnel).
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">User Management</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Approve or reject user registrations, manage user accounts, assign roles, and configure 
                                            department assignments and permissions for all user types.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Vehicle & Sticker Management</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Manage vehicle registrations, approve vehicle requests, process sticker requests, generate 
                                            QR-enabled stickers, and track active permits across campus.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Violation Report Review</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Review submitted violation reports with photo evidence, approve or reject reports, manage 
                                            violation statuses, and send email notifications to vehicle owners.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Patrol Monitoring</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Monitor security patrol coverage in real-time, view patrol logs, track checkpoint check-ins, 
                                            and ensure comprehensive campus security coverage.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Invoice & Fee Management</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Manage sticker fees, generate invoices for replacement stickers, track payment status, 
                                            and configure pricing for different sticker types.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">Automated Report Routing</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            System automatically routes violation reports to appropriate administrators based on violator 
                                            type: SAS Admin for students, Chancellor/Security Admin for others.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-xs sm:text-sm">System Configuration</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Configure violation types, sticker rules, parking zones, location types, vehicle types, 
                                            and other system-wide settings for customized campus management.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* --- HOW IT WORKS SECTION --- */}
                <section className="py-20 px-4 bg-muted/30">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                Simple, streamlined process from registration to enforcement.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Step 1 */}
                            <Card className="border-muted/40 shadow-sm">
                                <CardContent className="pt-6 text-center">
                                    <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                        1
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">Create Your Account</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Click 'Get Started' to create your MLUC Sentinel account. Provide your basic information and join 
                                        the digital parking management system.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Step 2 */}
                            <Card className="border-muted/40 shadow-sm">
                                <CardContent className="pt-6 text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4">
                                        2
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">Register Your Vehicle</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Visit campus administration to register your vehicle and receive your color-coded QR-enabled parking 
                                        sticker with unique identification.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Step 3 */}
                            <Card className="border-muted/40 shadow-sm">
                                <CardContent className="pt-6 text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4">
                                        3
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">Report Violations</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Scan parking sticker QR codes to instantly file violation reports. Upload photo evidence, select 
                                        violation types, and pin exact locations on the interactive campus map.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Step 4 */}
                            <Card className="border-muted/40 shadow-sm">
                                <CardContent className="pt-6 text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4">
                                        4
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">Manage & Monitor</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        Administrators review and process violation reports, track parking permit status, monitor security 
                                        patrol coverage, and access real-time analytics for complete parking and reporting operations management.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* --- FAQ SECTION --- */}
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                    <div className="mx-auto max-w-4xl px-2">
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Frequently Asked Questions</h2>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <FAQItem
                                question="How do I create an account?"
                                answer="Click &quot;Get Started&quot; to begin registration. Choose your role (Student, Staff, Stakeholder, Security Personnel, or Reporter), provide your personal information, and submit your registration. An administrator will review and approve your account before you can access the system."
                            />
                            <FAQItem
                                question="How do I get a parking sticker for my vehicle?"
                                answer="After your account is approved, you can submit a vehicle request through your dashboard. Once approved by administration, visit the campus administration office to receive your color-coded QR-enabled parking sticker. The sticker is linked to your vehicle and account for easy verification."
                            />
                            <FAQItem
                                question="What should I do if I lose my parking sticker?"
                                answer="Log in to your dashboard and submit a sticker replacement request through the Sticker Requests section. A replacement fee will apply. Administration will process your request and issue a new sticker with a unique QR code. The lost sticker will be deactivated in the system."
                            />
                            <FAQItem
                                question="How are parking violations reported?"
                                answer="Security personnel and authorized reporters can scan the QR code on any parking sticker using their mobile device. This instantly pulls up vehicle information, allowing them to file a violation report with photo evidence, select the violation type, and pin the exact location on the interactive campus map. Reports are automatically routed to the appropriate administrator for review."
                            />
                            <FAQItem
                                question="What happens after a violation is reported?"
                                answer="Administrators review all violation reports with the submitted evidence. They can approve or reject reports based on the documentation. If approved, the vehicle owner receives an email notification about the violation. All violations are tracked in the system with complete audit trails for accountability."
                            />
                            <FAQItem
                                question="Can I track security patrols on campus?"
                                answer="Yes! Security personnel use the patrol check-in system to scan QR codes at strategic checkpoints across campus. This logs patrol activities, tracks coverage areas, and maintains comprehensive patrol records. Administrators can monitor patrol coverage through the dashboard to ensure comprehensive campus security."
                            />
                            <FAQItem
                                question="How do I request additional vehicles for my account?"
                                answer="Log in to your dashboard and use the Vehicle Requests feature to submit a request for additional vehicles. Provide the vehicle details and submit for administrator approval. Once approved, you'll receive a new parking sticker for the additional vehicle."
                            />
                        </div>
                    </div>
                </section>

                {/* --- CONTACT SECTION --- */}
                <section className="py-12 sm:py-16 px-4 sm:px-6 bg-muted/30">
                    <div className="mx-auto max-w-4xl text-center px-2">
                        <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Contact Us</h2>
                        <p className="text-sm sm:text-lg text-muted-foreground">
                            For any inquiries, please contact the development team at:{' '}
                            <a href="mailto:ademesa.dev@gmail.com" className="text-primary hover:underline font-medium">
                                ademesa.dev@gmail.com
                            </a>
                        </p>
                    </div>
                </section>

                {/* --- UNIVERSITY INFORMATION SECTION --- */}
                <section className="py-12 sm:py-16 px-4 sm:px-6">
                    <div className="mx-auto max-w-4xl text-center px-2">
                        <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 px-2">
                            DON MARIANO MARCOS MEMORIAL STATE UNIVERSITY
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground mb-1">Mid La Union Campus</p>
                        <p className="text-sm sm:text-base text-muted-foreground">College of Information Technology</p>
                    </div>
                </section>
            </main>

            {/* --- FOOTER --- */}
            <footer className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
                <div className="mx-auto max-w-7xl text-center space-y-2 px-2">
                    <p className="text-xs sm:text-sm text-muted-foreground italic px-2">
                        MLUC Sentinel - A Digital Parking System. A Capstone Project by Dulay, S.A.C.; De Mesa, A.P.; Marzan, J.V.R.; Paz, D.G.F.; Saltivan, G.A.A. (2025).
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        © {new Date().getFullYear()} MLUC Sentinel. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

// FAQ Accordion Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="border-muted/40 shadow-sm">
            <button
                className="w-full p-6 text-left flex items-center justify-between gap-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-lg font-semibold">{question}</h3>
                <ChevronDown
                    className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {isOpen && (
                <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{answer}</p>
                </div>
            )}
        </Card>
    );
}
