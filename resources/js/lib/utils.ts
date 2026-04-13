import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
}

export function getAvatarColor(name: string): string {
    if (!name) return 'bg-primary text-white';
    const charCode = name.toUpperCase().charCodeAt(0);
    const colors = [
        'bg-chart-1',
        'bg-chart-2',
        'bg-chart-3',
        'bg-chart-4',
        'bg-chart-5',
    ];
    // We use the first letter to determine the background color
    return `${colors[charCode % colors.length]} text-white`;
}

/**
 * Parse a patrol QR code to extract the location identifier.
 * Supports:
 * 1. Direct alphanumeric ID or Short Code (e.g., "123", "A1")
 * 2. PATROL_POINT: prefixed format
 * 
 * @param rawValue - The raw QR code value
 * @returns The string identifier, or null if invalid
 */
export function parsePatrolQR(rawValue: string): string | null {
    if (!rawValue || typeof rawValue !== 'string') return null;

    const trimmed = rawValue.trim();
    if (!trimmed) return null;

    // 1. Try PATROL_POINT: prefix
    if (trimmed.startsWith('PATROL_POINT:')) {
        const parts = trimmed.split(':');
        if (parts.length === 2 && parts[1].trim()) {
            return parts[1].trim();
        }
    }

    // 2. Return the trimmed raw value (Short Code or ID)
    // We allow alphanumeric characters, hyphens and underscores
    if (/^[A-Za-z0-9-_]+$/.test(trimmed)) {
        return trimmed;
    }

    return null;
}

