import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';

interface User {
    name: string;
    avatar?: string;
    [key: string]: any;
}

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UserAvatarProps {
    user: User | null;
    size?: AvatarSize;
    className?: string;
    textClassName?: string;
}

const sizeMap: Record<AvatarSize, string> = {
    xs: 'size-6 text-[10px]',
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-16 text-xl',
    xl: 'size-20 text-2xl',
    '2xl': 'size-24 text-3xl',
};

export function UserAvatar({ user, size = 'md', className, textClassName }: UserAvatarProps) {
    if (!user) return null;

    const initials = getInitials(user.name);
    const colorClass = getAvatarColor(user.name);
    const sizeClasses = sizeMap[size];

    return (
        <Avatar className={cn('overflow-hidden rounded-full shrink-0', sizeClasses, className)}>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className={cn('font-medium uppercase select-none', colorClass, textClassName)}>
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
