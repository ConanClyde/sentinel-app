import * as React from "react"
import { Link, usePage } from "@inertiajs/react"
import { type SharedData } from "@/types"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Menu, Bell, Car, Users, ShieldAlert, LayoutGrid, User, Settings, LogOut, BarChart3, Tag, Map, Activity, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import AppLogo from "./app-logo"
import { cn } from "@/lib/utils"

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon: any; title: string; href: string }
>(({ className, title, children, icon: Icon, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref as any}
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props as any}
        >
          <div className="flex items-center gap-2 mb-1">
             <Icon className="h-4 w-4 text-primary" />
             <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function AppNavbar() {
  const { auth } = usePage<SharedData>().props
  const user = auth.user as any
  const userRole = user?.role

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 pb-safe md:px-6">
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
              <Link href={route('dashboard')} className="flex items-center gap-2 px-2" onClick={() => setIsMobileMenuOpen(false)}>
                <AppLogo />
              </Link>
              <nav className="flex flex-col gap-2">
                <Link
                  href={route('dashboard')}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Dashboard
                </Link>
                {userRole === 'Administrator' && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Management
                    </div>
                    <Link
                      href={route('admin.users.index')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      User Management
                    </Link>
                    <Link
                      href={route('admin.pending-registrations.index')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Pending Users
                    </Link>
                    <Link
                      href={route('admin.vehicles.index')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Car className="h-4 w-4" />
                      Vehicles
                    </Link>

                    <div className="px-3 py-2 mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Operations
                    </div>
                    <Link
                      href={route('admin.map.index')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Map className="h-4 w-4" />
                      Campus Map
                    </Link>
                    <Link
                      href={route('admin.patrol.index')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Activity className="h-4 w-4" />
                      Patrol Monitor
                    </Link>
                    <Link
                      href={route('admin.stickers.index')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Tag className="h-4 w-4" />
                      Stickers
                    </Link>

                    <div className="px-3 py-2 mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Analytics
                    </div>
                    <Link
                      href={route('admin.reports.index')}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Reports
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href={route('dashboard')} className="flex items-center gap-2 mr-4 md:mr-8">
          <AppLogo />
        </Link>

        {/* Desktop Navigation - Mega Menu Style */}
        <div className="hidden md:flex flex-1 items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href={route('dashboard')} className={navigationMenuTriggerStyle()}>
                  Dashboard
                </Link>
              </NavigationMenuItem>

              {userRole === 'Administrator' && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Management</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <ListItem
                          title="User Management"
                          href={route('admin.users.index')}
                          icon={Users}
                        >
                          Control system access, roles, and member permissions.
                        </ListItem>
                        <ListItem
                          title="Pending Users"
                          href={route('admin.pending-registrations.index')}
                          icon={ShieldAlert}
                        >
                          Review and approve new identity verification requests.
                        </ListItem>
                        <ListItem
                          title="Vehicles"
                          href={route('admin.vehicles.index')}
                          icon={Car}
                        >
                          Monitor the database of registered campus vehicles.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Operations</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <ListItem
                          title="Campus Map"
                          href={route('admin.map.index')}
                          icon={Map}
                        >
                          Interactive geospatial view of security posts and nodes.
                        </ListItem>
                        <ListItem
                          title="Patrol Monitor"
                          href={route('admin.patrol.index')}
                          icon={Activity}
                        >
                          Real-time monitoring of active security patrol units.
                        </ListItem>
                        <ListItem
                          title="Stickers"
                          href={route('admin.stickers.index')}
                          icon={Tag}
                        >
                          Manage physical access permits and window tags.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link href={route('admin.reports.index')} className={navigationMenuTriggerStyle()}>
                      Reports
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side - Notifications + Avatar Dropdown */}
        <div className="flex items-center justify-end gap-1 md:gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarFallback className="rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={route('profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
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
  )
}
