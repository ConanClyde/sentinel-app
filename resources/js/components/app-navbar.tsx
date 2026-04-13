import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Permissions, useHasPermission } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { type SharedData, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Car,
    ClipboardList,
    IdCard,
    LayoutGrid,
    LogOut,
    Map,
    Menu,
    QrCode,
    Settings,
    ShieldAlert,
    ShieldCheck,
    ShieldPlus,
    Tag,
    Receipt,
    Ticket,
    User as UserIcon,
    Users,
} from 'lucide-react';
import * as React from 'react';
import AppLogo from './app-logo';
import { NotificationDropdown } from './notification-dropdown';
import { UserAvatar } from './user-avatar';

const ListItem = React.forwardRef<
    React.ElementRef<'a'>,
    React.ComponentPropsWithoutRef<'a'> & { icon: any; title: string; href: string; badge?: number | string }
>(({ className, title, children, icon: Icon, href, badge, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    ref={ref as any}
                    href={href}
                    className={cn(
                        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none',
                        className,
                    )}
                    {...(props as any)}
                >
                    <div className="mb-1 flex items-center justify-between pr-2">
                        <div className="flex items-center gap-2">
                            <Icon className="text-primary h-4 w-4" />
                            <div className="text-sm leading-none font-medium">{title}</div>
                        </div>
                        {badge && (
                            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white/20">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = 'ListItem';

export function AppNavbar() {
    const { auth, pendingApprovalsCount, pendingReportsCount, myPendingReportsCount } = usePage<SharedData>().props;
    const user = auth.user as User;
    const userRole = user?.role;

    const pViewUsers = useHasPermission(Permissions.VIEW_USERS);
    const pViewRegistrations = useHasPermission(Permissions.VIEW_REGISTRATIONS);
    const pViewVehicles = useHasPermission(Permissions.VIEW_VEHICLES);
    const pDirectRegistration = useHasPermission(Permissions.DIRECT_REGISTRATION);
    const pViewMap = useHasPermission(Permissions.VIEW_MAP);
    const pManagePatrols = useHasPermission(Permissions.MANAGE_PATROLS);
    const pViewStickers = useHasPermission(Permissions.VIEW_STICKERS);
    const pViewInvoices = useHasPermission(Permissions.VIEW_INVOICES);
    const pViewConfig = useHasPermission(Permissions.VIEW_CONFIG);
    const pViewReports = useHasPermission(Permissions.VIEW_REPORTS);

    const isRegisteredUser = userRole === 'Student' || userRole === 'Staff' || userRole === 'Stakeholder';
    const isNonAdminRole = isRegisteredUser || userRole === 'Department Officer' || userRole === 'Reporter' || userRole === 'Security Personnel';

    const showAdminNav =
        !isNonAdminRole &&
        (pViewUsers ||
            pViewRegistrations ||
            pViewVehicles ||
            pDirectRegistration ||
            pViewMap ||
            pManagePatrols ||
            pViewStickers ||
            pViewConfig ||
            pViewReports);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <header className="bg-background sticky top-0 z-50 w-full border-b">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 md:px-6 lg:px-8">
                {/* Mobile Menu Sheet - only on small screens */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72" onInteractOutside={() => {}}>
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                        <div className="flex flex-col gap-4 py-4">
                            <Link href={route('dashboard')} className="mb-4 flex items-center gap-2 px-2" onClick={() => setIsMobileMenuOpen(false)}>
                                <AppLogo />
                            </Link>
                            <nav className="flex flex-col gap-2">
                                {userRole !== 'Department Officer' && (
                                    <Link
                                        href={route('dashboard')}
                                        className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                )}
                                {showAdminNav && (
                                    <>
                                        {(pViewReports || pViewRegistrations || pDirectRegistration || (pViewVehicles && userRole !== 'Administrator') || pViewStickers || pViewInvoices) && (
                                            <div className="text-muted-foreground/70 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                                <Activity className="h-3 w-3" />
                                                Operations
                                            </div>
                                        )}
                                        {pViewReports && (
                                            <Link
                                                href={route('admin.reports.index')}
                                                className="hover:bg-accent flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    Reports
                                                </div>
                                                {pendingReportsCount > 0 && (
                                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10">
                                                        {pendingReportsCount}
                                                    </span>
                                                )}
                                            </Link>
                                        )}
                                        {pViewRegistrations && (
                                            <Link
                                                href={route('admin.pending-approvals.index')}
                                                className="hover:bg-accent flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    Pending Approvals
                                                </div>
                                                {pendingApprovalsCount > 0 && (
                                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10">
                                                        {pendingApprovalsCount}
                                                    </span>
                                                )}
                                            </Link>
                                        )}
                                        {pViewVehicles && (
                                            <Link
                                                href={route('admin.pending-vehicles.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Car className="h-4 w-4" />
                                                Pending Vehicles
                                            </Link>
                                        )}
                                        {pDirectRegistration && (
                                            <Link
                                                href={route('admin.registration.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <IdCard className="h-4 w-4" />
                                                Registration
                                            </Link>
                                        )}
                                        {pViewStickers && (
                                            <Link
                                                href={route('admin.sticker-requests.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Tag className="h-4 w-4" />
                                                Sticker Request
                                            </Link>
                                        )}
                                        {pViewInvoices && (
                                            <Link
                                                href={route('admin.invoices.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Receipt className="h-4 w-4" />
                                                Invoice
                                            </Link>
                                        )}

                                        {(pViewConfig || pViewUsers || (userRole === 'Administrator' && pViewVehicles) || pManagePatrols || pViewStickers) && (
                                            <div className="text-muted-foreground/70 mt-4 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                                <ShieldPlus className="h-3 w-3" />
                                                Management
                                            </div>
                                        )}
                                        {pViewUsers && (
                                            <Link
                                                href={route('admin.users.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Users className="h-4 w-4" />
                                                User Management
                                            </Link>
                                        )}
                                        {pManagePatrols && (
                                            <Link
                                                href={route('admin.patrol.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Activity className="h-4 w-4" />
                                                Patrol Monitor
                                            </Link>
                                        )}
                                        {pViewStickers && (
                                            <Link
                                                href={route('admin.stickers.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Ticket className="h-4 w-4" />
                                                Stickers
                                            </Link>
                                        )}
                                        {userRole === 'Administrator' && pViewVehicles && (
                                            <Link
                                                href={route('shared.vehicles')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Car className="h-4 w-4" />
                                                Vehicles
                                            </Link>
                                        )}
                                        {userRole === 'Administrator' && pViewReports && (
                                            <Link
                                                href={route('admin.reports.index')}
                                                className="hover:bg-accent flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    Reports Audit
                                                </div>
                                            </Link>
                                        )}
                                        {pViewConfig && (
                                            <Link
                                                href={route('admin.config.index')}
                                                className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4" />
                                                Configuration
                                            </Link>
                                        )}
                                    </>
                                )}

                                {(userRole === 'Student' || userRole === 'Staff' || userRole === 'Stakeholder') && (
                                    <>
                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <LayoutGrid className="h-3 w-3" />
                                            Platform
                                        </div>
                                        <Link
                                            href={route('dashboard')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                            Dashboard
                                        </Link>

                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <Car className="h-3 w-3" />
                                            Vehicles
                                        </div>
                                        <Link
                                            href={route('shared.vehicles')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Car className="h-4 w-4" />
                                            My Vehicles
                                        </Link>
                                        <Link
                                            href={route('shared.sticker-requests')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Tag className="h-4 w-4" />
                                            Sticker Requests
                                        </Link>

                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <ClipboardList className="h-3 w-3" />
                                            History
                                        </div>
                                        <Link
                                            href={route('shared.report-history')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            Report History
                                        </Link>
                                    </>
                                )}

                                {userRole === 'Security Personnel' && (
                                    <>
                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <Activity className="h-3 w-3" />
                                            Patrol
                                        </div>
                                        <Link
                                            href={route('security.scan')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <QrCode className="h-4 w-4" />
                                            Scan Patrol Point
                                        </Link>
                                        <Link
                                            href={route('security.history')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Activity className="h-4 w-4" />
                                            My Patrol History
                                        </Link>

                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <ShieldAlert className="h-3 w-3" />
                                            Reporting
                                        </div>
                                        <Link
                                            href={route('shared.report')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                            Report User
                                        </Link>
                                        <Link
                                            href={route('shared.my-reports')}
                                            className="hover:bg-accent flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ClipboardList className="h-4 w-4" />
                                                My Reports
                                            </div>
                                            {myPendingReportsCount > 0 && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10">
                                                    {myPendingReportsCount}
                                                </span>
                                            )}
                                        </Link>
                                        <Link
                                            href={route('shared.report-history')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                            My Violations
                                        </Link>

                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <Car className="h-3 w-3" />
                                            Vehicles
                                        </div>
                                        <Link
                                            href={route('shared.vehicles')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Car className="h-4 w-4" />
                                            My Vehicles
                                        </Link>
                                        <Link
                                            href={route('shared.sticker-requests')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Tag className="h-4 w-4" />
                                            Sticker Requests
                                        </Link>
                                    </>
                                )}

                                {userRole === 'Reporter' && (
                                    <>
                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <ShieldAlert className="h-3 w-3" />
                                            Enforcement
                                        </div>
                                        <Link
                                            href={route('dashboard')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={route('shared.report')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                            Report User
                                        </Link>
                                        <Link
                                            href={route('shared.my-reports')}
                                            className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            My Reports
                                        </Link>
                                    </>
                                )}

                                {userRole === 'Department Officer' && (
                                    <>
                                        {/* Platform */}
                                        <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                            <LayoutGrid className="h-3 w-3" /> Platform
                                        </div>
                                        <Link href={route('dashboard')} className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                            <LayoutGrid className="h-4 w-4" /> Dashboard
                                        </Link>

                                        {/* Operations */}
                                        {(pViewReports || pManagePatrols) && (
                                            <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                                <Activity className="h-3 w-3" /> Operations
                                            </div>
                                        )}
                                        {pViewReports && (
                                            <Link href={route('admin.reports.index')} className="hover:bg-accent flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                                <div className="flex items-center gap-3"><ShieldAlert className="h-4 w-4" /> Reports</div>
                                                {pendingReportsCount > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{pendingReportsCount}</span>}
                                            </Link>
                                        )}
                                        {pManagePatrols && (
                                            <Link href={route('admin.patrol.index')} className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Activity className="h-4 w-4" /> Patrol Monitor
                                            </Link>
                                        )}

                                        {/* Management */}
                                        {(pViewUsers || pViewVehicles || pViewStickers || pViewInvoices) && (
                                            <div className="text-muted-foreground/70 mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                                                <ShieldPlus className="h-3 w-3" /> Management
                                            </div>
                                        )}
                                        {pViewUsers && (
                                            <Link href={route('admin.users.index')} className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Users className="h-4 w-4" /> Users
                                            </Link>
                                        )}
                                        {pViewVehicles && (
                                            <Link href={route('shared.vehicles')} className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Car className="h-4 w-4" /> Vehicles
                                            </Link>
                                        )}
                                        {pViewStickers && (
                                            <>
                                                <Link href={route('admin.stickers.index')} className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <Ticket className="h-4 w-4" /> Stickers
                                                </Link>
                                                <Link href={route('admin.sticker-requests.index')} className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                                    <Tag className="h-4 w-4" /> Sticker Requests
                                                </Link>
                                            </>
                                        )}
                                        {pViewInvoices && (
                                            <Link href={route('admin.invoices.index')} className="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Receipt className="h-4 w-4" /> Invoices
                                            </Link>
                                        )}
                                        {/* Campus Map — standalone like admin */}
                                        <Link href={route('shared.map')} className="hover:bg-accent flex items-center gap-3 rounded-lg border-t px-3 py-2 pt-4 text-sm font-medium mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Map className="h-4 w-4" /> Campus Map
                                        </Link>
                                    </>
                                )}
                                {pViewMap && userRole !== 'Department Officer' && (
                                    <Link
                                        href={route('shared.map')}
                                        className="hover:bg-accent mt-auto flex items-center gap-3 rounded-lg border-t px-3 py-2 pt-4 text-sm font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Map className="h-4 w-4" />
                                        Campus Map
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo - hidden on mobile when menu is shown */}
                <Link href={route('dashboard')} className="mr-8 flex items-center gap-2 md:mr-10 lg:mr-12">
                    <AppLogo />
                </Link>

                {/* Spacer to push everything else to the right on mobile */}
                <div className="flex-1 md:hidden" />

                {/* Desktop Navigation - Centered */}
                <div className="hidden flex-1 items-center justify-center md:flex">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {userRole !== 'Department Officer' && (
                                <NavigationMenuItem>
                                    <Link href={route('dashboard')} className={cn(navigationMenuTriggerStyle(), 'gap-2')}>
                                        <LayoutGrid className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </NavigationMenuItem>
                            )}

                            {showAdminNav && (
                                <>
                                    {(pViewReports || pViewRegistrations || pDirectRegistration || pViewVehicles || pViewStickers || pViewInvoices) && (
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Operations
                                                {(pendingApprovalsCount > 0 || pendingReportsCount > 0) && (
                                                    <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white/10">
                                                        {pendingApprovalsCount + pendingReportsCount}
                                                    </span>
                                                )}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                    {pViewReports && (
                                                        <ListItem
                                                            title="Reports"
                                                            href={route('admin.reports.index')}
                                                            icon={ShieldAlert}
                                                            badge={pendingReportsCount > 0 ? pendingReportsCount : undefined}
                                                        >
                                                            Review and process incident and violation reports.
                                                        </ListItem>
                                                    )}
                                                    {pViewRegistrations && (
                                                        <ListItem
                                                            title="Pending Approvals"
                                                            href={route('admin.pending-approvals.index')}
                                                            icon={ShieldCheck}
                                                            badge={pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined}
                                                        >
                                                            Review and approve new identity verification requests.
                                                        </ListItem>
                                                    )}
                                                    {pViewVehicles && (
                                                        <ListItem title="Pending Vehicles" href={route('admin.pending-vehicles.index')} icon={Car}>
                                                            Review and approve vehicle registration requests from campus members.
                                                        </ListItem>
                                                    )}
                                                    {pDirectRegistration && (
                                                        <ListItem title="Registration" href={route('admin.registration.index')} icon={IdCard}>
                                                            Access and manage the master registration records and logs.
                                                        </ListItem>
                                                    )}
                                                    {pViewStickers && (
                                                        <ListItem
                                                            title="Sticker Request"
                                                            href={route('admin.sticker-requests.index')}
                                                            icon={Tag}
                                                        >
                                                            Review and process renewal and replacement sticker requests.
                                                        </ListItem>
                                                    )}
                                                    {pViewInvoices && (
                                                        <ListItem
                                                            title="Invoice"
                                                            href={route('admin.invoices.index')}
                                                            icon={Receipt}
                                                        >
                                                            Manage sticker fee invoices and payments.
                                                        </ListItem>
                                                    )}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    )}

                                    {(pViewConfig || pViewUsers || pViewVehicles || pManagePatrols || pViewStickers) &&
                                        userRole !== 'Security Personnel' && (
                                            <NavigationMenuItem>
                                                <NavigationMenuTrigger className="flex items-center gap-2">
                                                    <ShieldPlus className="h-4 w-4" />
                                                    Management
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent>
                                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                        {pViewUsers && (
                                                            <ListItem title="User Management" href={route('admin.users.index')} icon={Users}>
                                                                Control system access, roles, and member permissions.
                                                            </ListItem>
                                                        )}
                                                        {pManagePatrols && (
                                                            <ListItem title="Patrol Monitor" href={route('admin.patrol.index')} icon={Activity}>
                                                                Real-time monitoring of active security patrol units.
                                                            </ListItem>
                                                        )}
                                                        {pViewStickers && (
                                                            <ListItem title="Stickers" href={route('admin.stickers.index')} icon={Ticket}>
                                                                Manage physical access permits and window tags.
                                                            </ListItem>
                                                        )}
                                                        {userRole === 'Administrator' && pViewVehicles && (
                                                            <ListItem title="Vehicles" href={route('shared.vehicles')} icon={Car}>
                                                                Monitor the database of registered campus vehicles.
                                                            </ListItem>
                                                        )}
                                                        {userRole === 'Administrator' && pViewReports && (
                                                            <ListItem title="Reports Audit" href={route('admin.reports.index')} icon={ShieldAlert}>
                                                                Long-term violation tracking and incident history.
                                                            </ListItem>
                                                        )}
                                                        {pViewConfig && (
                                                            <ListItem title="Configuration" href={route('admin.config.index')} icon={Settings}>
                                                                Calibrate system-wide operational and security settings.
                                                            </ListItem>
                                                        )}
                                                    </ul>
                                                </NavigationMenuContent>
                                            </NavigationMenuItem>
                                        )}
                                </>
                            )}

                            {(userRole === 'Student' || userRole === 'Staff' || userRole === 'Stakeholder') && (
                                <>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="gap-2">
                                            <Car className="h-4 w-4" />
                                            Vehicles
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[300px] gap-3 p-4">
                                                <ListItem title="My Vehicles" href={route('shared.vehicles')} icon={Car}>
                                                    Manage registered units.
                                                </ListItem>
                                                <ListItem title="Sticker Requests" href={route('shared.sticker-requests')} icon={Tag}>
                                                    Request new access permits.
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <Link href={route('shared.report-history')} className={cn(navigationMenuTriggerStyle(), 'gap-2')}>
                                            <ClipboardList className="h-4 w-4" />
                                            Report History
                                        </Link>
                                    </NavigationMenuItem>
                                </>
                            )}

                            {userRole === 'Security Personnel' && (
                                <>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="gap-2">
                                            <Activity className="h-4 w-4" />
                                            Patrol
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[300px] gap-3 p-4">
                                                <ListItem title="Scan Patrol Point" href={route('security.scan')} icon={QrCode}>
                                                    Log your presence at designated patrol nodes.
                                                </ListItem>
                                                <ListItem title="Patrol Logs" href={route('security.history')} icon={Activity}>
                                                    Check your past patrol history and route metrics.
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="gap-2">
                                            <ShieldAlert className="h-4 w-4" />
                                            Reporting
                                            {myPendingReportsCount > 0 && (
                                                <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white/10">
                                                    {myPendingReportsCount}
                                                </span>
                                            )}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[300px] gap-3 p-4">
                                                <ListItem title="Report User" href={route('shared.report')} icon={ShieldAlert}>
                                                    File new violations by scanning or manual identity search.
                                                </ListItem>
                                                <ListItem
                                                    title="My Reports"
                                                    href={route('shared.my-reports')}
                                                    icon={ClipboardList}
                                                    badge={myPendingReportsCount > 0 ? myPendingReportsCount : undefined}
                                                >
                                                    Review all incident and violation reports you have submitted.
                                                </ListItem>
                                                <ListItem title="My Violations" href={route('shared.report-history')} icon={ShieldAlert}>
                                                    View any violations reported against your account.
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="gap-2">
                                            <Car className="h-4 w-4" />
                                            Vehicles
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[300px] gap-3 p-4">
                                                <ListItem title="My Vehicles" href={route('shared.vehicles')} icon={Car}>
                                                    Manage your personal registered vehicles.
                                                </ListItem>
                                                <ListItem title="Sticker Requests" href={route('shared.sticker-requests')} icon={Tag}>
                                                    Request or renew personal access permits.
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                </>
                            )}

                            {userRole === 'Reporter' && (
                                <>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger className="gap-2">
                                            <ShieldAlert className="h-4 w-4" />
                                            Enforcement
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[300px] gap-3 p-4">
                                                <ListItem title="Report User" href={route('shared.report')} icon={ShieldAlert}>
                                                    File new incident and violation reports.
                                                </ListItem>
                                                <ListItem title="My Reports" href={route('shared.my-reports')} icon={ClipboardList}>
                                                    Review all reports you have submitted.
                                                </ListItem>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                </>
                            )}

                            {userRole === 'Department Officer' && (
                                <>
                                    <NavigationMenuItem>
                                        <Link href={route('dashboard')} className={cn(navigationMenuTriggerStyle(), 'gap-2')}>
                                            <LayoutGrid className="h-4 w-4" /> Dashboard
                                        </Link>
                                    </NavigationMenuItem>

                                    {/* Operations dropdown */}
                                    {(pViewReports || pManagePatrols) && (
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger className="gap-2">
                                                <Activity className="h-4 w-4" /> Operations
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                    {pViewReports && (
                                                        <ListItem title="Reports" href={route('admin.reports.index')} icon={ShieldAlert} badge={pendingReportsCount > 0 ? pendingReportsCount : undefined}>
                                                            Review and process incident reports.
                                                        </ListItem>
                                                    )}
                                                    {pManagePatrols && (
                                                        <ListItem title="Patrol Monitor" href={route('admin.patrol.index')} icon={Activity}>
                                                            View live patrol monitoring.
                                                        </ListItem>
                                                    )}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    )}

                                    {/* Management dropdown */}
                                    {(pViewUsers || pViewVehicles || pViewStickers || pViewInvoices) && (
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger className="gap-2">
                                                <ShieldPlus className="h-4 w-4" /> Management
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                    {pViewUsers && (
                                                        <ListItem title="Users" href={route('admin.users.index')} icon={Users}>
                                                            View registered campus members.
                                                        </ListItem>
                                                    )}
                                                    {pViewVehicles && (
                                                        <ListItem title="Vehicles" href={route('shared.vehicles')} icon={Car}>
                                                            View registered campus vehicles.
                                                        </ListItem>
                                                    )}
                                                    {pViewStickers && (
                                                        <ListItem title="Stickers" href={route('admin.stickers.index')} icon={Ticket}>
                                                            View vehicle stickers.
                                                        </ListItem>
                                                    )}
                                                    {pViewStickers && (
                                                        <ListItem title="Sticker Requests" href={route('admin.sticker-requests.index')} icon={Tag}>
                                                            Review sticker requests.
                                                        </ListItem>
                                                    )}
                                                    {pViewInvoices && (
                                                        <ListItem title="Invoices" href={route('admin.invoices.index')} icon={Receipt}>
                                                            View sticker fee invoices.
                                                        </ListItem>
                                                    )}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    )}
                                    {/* Campus Map — standalone link like admin */}
                                    <NavigationMenuItem>
                                        <Link href={route('shared.map')} className={cn(navigationMenuTriggerStyle(), 'gap-2')}>
                                            <Map className="h-4 w-4" /> Campus Map
                                        </Link>
                                    </NavigationMenuItem>
                                </>
                            )}

                            {pViewMap && userRole !== 'Department Officer' && (
                                <NavigationMenuItem>
                                    <Link href={route('shared.map')} className={cn(navigationMenuTriggerStyle(), 'gap-2')}>
                                        <Map className="h-4 w-4" />
                                        Campus Map
                                    </Link>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right side - Notifications + Avatar Dropdown */}
                <div className="flex items-center justify-end gap-1 md:gap-2">
                    <NotificationDropdown />
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <UserAvatar user={user} size="sm" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm leading-none font-medium">{user?.name}</p>
                                    <p className="text-muted-foreground text-xs leading-none">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={route('profile')} className="cursor-pointer">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route('settings')} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={route('logout')} method="post" className="cursor-pointer text-red-500 focus:text-red-500">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
