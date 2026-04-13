import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface UserComboboxProps {
    users: UserData[];
    value: string;
    onChange: (userId: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export function UserCombobox({ users, value, onChange, placeholder = 'Select user...', disabled = false, error }: UserComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const selectedUser = React.useMemo(() => {
        return users.find((u) => u.id.toString() === value);
    }, [users, value]);

    const filteredUsers = React.useMemo(() => {
        if (!search) return users;
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.role.toLowerCase().includes(search.toLowerCase()),
        );
    }, [users, search]);

    const handleSelect = (userId: string) => {
        onChange(userId);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn('h-10 w-full justify-between font-normal', !value && 'text-muted-foreground', error && 'border-destructive')}
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedUser ? (
                            <>
                                <UserAvatar user={selectedUser} size="xs" />
                                <span className="truncate">{selectedUser.name}</span>
                            </>
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="z-50 max-h-[300px] w-[var(--radix-popover-trigger-width)] min-w-0 overflow-hidden rounded-xl p-0"
                align="start"
            >
                <Command shouldFilter={false}>
                    <CommandInput placeholder="Search by name, email or role..." value={search} onValueChange={setSearch} />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                            {filteredUsers.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={user.id.toString()}
                                    onSelect={() => handleSelect(user.id.toString())}
                                    className="flex items-center gap-2 py-2"
                                >
                                    <UserAvatar user={user} size="xs" />
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="text-muted-foreground truncate text-[10px]">
                                            {user.email} • {user.role}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
