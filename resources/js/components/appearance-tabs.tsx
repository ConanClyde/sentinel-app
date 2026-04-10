import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className={cn('inline-flex gap-1.5 rounded-xl bg-muted/50 p-1.5 border border-muted/30', className)} {...props}>
            {tabs.map(({ value, icon: Icon, label }) => {
                const isActive = appearance === value;
                return (
                    <button
                        key={value}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center gap-2 rounded-xl px-5 py-2.5 transition-all duration-300 font-bold text-xs uppercase tracking-widest',
                            isActive
                                ? 'bg-background text-foreground ring-1 ring-muted/20 animate-in zoom-in-95'
                                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                    >
                        <Icon className={cn('h-3.5 w-3.5 transition-transform duration-500', isActive && 'text-primary scale-110')} />
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
