import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
    className?: string;
}

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
    {
        label: 'At least 8 characters',
        test: (password) => password.length >= 8,
    },
    {
        label: 'Contains an uppercase letter',
        test: (password) => /[A-Z]/.test(password),
    },
    {
        label: 'Contains a number',
        test: (password) => /[0-9]/.test(password),
    },
];

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        const passedRequirements = requirements.filter((req) => req.test(password)).length;
        setStrength(passedRequirements);
    }, [password]);

    const getStrengthLabel = () => {
        if (strength === 0) return { label: '', color: '' };
        if (strength <= 1) return { label: 'Weak', color: 'text-red-500' };
        if (strength <= 2) return { label: 'Medium', color: 'text-yellow-500' };
        return { label: 'Strong', color: 'text-green-500' };
    };

    const strengthInfo = getStrengthLabel();

    if (!password) return null;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Strength bar */}
            <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((level) => (
                        <div
                            key={level}
                            className={cn(
                                'h-1.5 flex-1 rounded-full transition-colors',
                                strength >= level
                                    ? strength <= 1
                                        ? 'bg-red-500'
                                        : strength <= 2
                                          ? 'bg-yellow-500'
                                          : 'bg-green-500'
                                    : 'bg-muted',
                            )}
                        />
                    ))}
                </div>
                {strengthInfo.label && (
                    <span className={cn('text-xs font-medium', strengthInfo.color)}>{strengthInfo.label}</span>
                )}
            </div>

            {/* Requirements list */}
            <div className="flex flex-col gap-1">
                {requirements.map((req, index) => {
                    const passed = req.test(password);
                    return (
                        <div
                            key={index}
                            className={cn('flex items-center gap-1.5 text-xs', passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}
                        >
                            {passed ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                <X className="h-3 w-3" />
                            )}
                            <span>{req.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
