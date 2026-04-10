import { type User } from '@/types';

export function useInitials() {
    const getInitials = (user: User): string => {
        const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || '';
        const surnameInitial = user.surname?.charAt(0)?.toUpperCase() || '';

        return `${firstInitial}${surnameInitial}`;
    };

    return getInitials;
}
