import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
    backHref?: string;
    showHomeIcon?: boolean;
    progress?: number;
}

export default function AuthSimpleLayout({ children, title, description, backHref, showHomeIcon, progress }: AuthLayoutProps) {
    useFlashToast();

    return (
        <div className="bg-background flex min-h-screen flex-col items-center justify-center overflow-y-auto px-4 py-8 pb-[env(safe-area-inset-bottom)] md:px-6 lg:justify-center lg:py-0">
            {/* Back/Home button - fixed position for mobile */}
            <div className="fixed left-4 top-4 z-50 md:left-6 md:top-6">
                <Link href={backHref || route('home')}>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md">
                        {showHomeIcon ? <Home className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                    </Button>
                </Link>
            </div>

            {/* Theme toggle - fixed position for mobile */}
            <div className="fixed right-4 top-4 z-50 md:right-6 md:top-6">
                <AppearanceToggleDropdown />
            </div>

            {/* Main content container */}
            <div className="flex w-full max-w-sm flex-col gap-6 py-8">
                {/* Logo and title section */}
                <div className="flex flex-col items-center gap-4">
                    <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform active:scale-95">
                            <AppLogoIcon className="size-7 fill-current text-[var(--foreground)] dark:text-white" />
                        </div>
                        <span className="sr-only">Sentinel Home</span>
                    </Link>

                    <div className="space-y-1.5 text-center w-full">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground text-sm">{description}</p>
                        {progress !== undefined && (
                            <div className="pt-4">
                                <Progress value={progress} className="h-2 w-full mx-auto" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Form content */}
                <div className="flex flex-col">{children}</div>
            </div>
        </div>
    );
}
