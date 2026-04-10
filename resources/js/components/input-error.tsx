import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <p {...props} className={cn('text-[11px] font-bold uppercase tracking-tight text-destructive animate-in fade-in duration-300', className)}>
            {message}
        </p>
    );
}
