import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Program {
    id: number;
    name: string;
    code: string;
}

interface College {
    id: number;
    name: string;
    code: string;
    programs: Program[];
}

interface ProgramComboboxProps {
    colleges: College[];
    value: string;
    onChange: (programId: string, collegeId: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export function ProgramCombobox({
    colleges,
    value,
    onChange,
    placeholder = 'Select program...',
    disabled = false,
    error,
}: ProgramComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    // Find selected program and college
    const getSelectedDisplay = () => {
        if (!value) return null;
        for (const college of colleges) {
            const program = college.programs.find((p) => p.id.toString() === value);
            if (program) {
                return `${college.code} - ${program.name}`;
            }
        }
        return null;
    };

    // Filter programs based on search
    const filteredColleges = React.useMemo(() => {
        if (!search) return colleges;

        return colleges
            .map((college) => ({
                ...college,
                programs: college.programs.filter((program) =>
                    program.name.toLowerCase().includes(search.toLowerCase()) ||
                    program.code.toLowerCase().includes(search.toLowerCase()) ||
                    college.name.toLowerCase().includes(search.toLowerCase()) ||
                    college.code.toLowerCase().includes(search.toLowerCase())
                ),
            }))
            .filter((college) => college.programs.length > 0);
    }, [colleges, search]);

    const handleSelect = (programId: string) => {
        // Find the college for this program
        for (const college of colleges) {
            const program = college.programs.find((p) => p.id.toString() === programId);
            if (program) {
                onChange(programId, college.id.toString());
                break;
            }
        }
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
                    className={cn(
                        'h-10 w-full justify-between font-normal',
                        !value && 'text-muted-foreground',
                        error && 'border-destructive'
                    )}
                >
                    <span className="truncate">{value ? getSelectedDisplay() : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-0 p-0 z-50 max-h-[300px] overflow-hidden rounded-xl" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search program..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList className="max-h-[250px] overflow-y-auto">
                        <CommandEmpty>No program found.</CommandEmpty>
                        {filteredColleges.map((college) => (
                            <CommandGroup key={college.id} heading={college.name}>
                                {college.programs.map((program) => (
                                    <CommandItem
                                        key={program.id}
                                        value={program.id.toString()}
                                        onSelect={handleSelect}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === program.id.toString() ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        {program.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
