import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile Content',
            url: route('profile.edit'),
            icon: null,
        },
        {
            title: 'Security',
            url: route('password.edit'),
            icon: null,
        },
        {
            title: 'App Appearance',
            url: route('appearance'),
            icon: null,
        },
    ];

    return (
        <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">Settings</h1>
                <p className="text-muted-foreground text-base">Configure your personal identity and security preferences.</p>
            </div>

            <Separator className="bg-muted/40" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-16">
                <aside className="lg:w-64">
                    <nav className="flex flex-col gap-1.5">
                        {sidebarNavItems.map((item) => {
                            const isActiveRoute = 
                                (item.title === 'Profile Content' && route().current('profile.edit')) ||
                                (item.title === 'Security' && route().current('password.edit')) ||
                                (item.title === 'App Appearance' && route().current('appearance'));

                            return (
                                <Link
                                    key={item.url}
                                    href={item.url}
                                    prefetch
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group',
                                        isActiveRoute 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <span className="flex-1 tracking-tight">{item.title}</span>
                                    {isActiveRoute && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-in zoom-in duration-300" />}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 lg:max-w-3xl">
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
