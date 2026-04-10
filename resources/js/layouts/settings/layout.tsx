import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            url: route('profile.edit'),
            icon: null,
        },
        {
            title: 'Password',
            url: route('password.edit'),
            icon: null,
        },
        {
            title: 'Appearance',
            url: route('appearance'),
            icon: null,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item) => {
                            const isActive = route().current(item.url.split('/').pop()?.split('.').shift() || ''); 
                            // Simplified isActive check since route names are like 'profile.edit'
                            // Let's do a better check.
                            const isActiveRoute = 
                                (item.title === 'Profile' && route().current('profile.edit')) ||
                                (item.title === 'Password' && route().current('password.edit')) ||
                                (item.title === 'Appearance' && route().current('appearance'));

                            return (
                                <Button
                                    key={item.url}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted font-medium': isActiveRoute,
                                    })}
                                >
                                    <Link href={item.url} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
