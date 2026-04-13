import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ModalDrawerProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modal?: boolean;
}

export function ModalDrawer({ children, open, onOpenChange, modal }: ModalDrawerProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange} modal={modal}>
                {children}
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
            {children}
        </Dialog>
    );
}

export function ModalDrawerTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode;
    asChild?: boolean;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <SheetTrigger asChild={asChild}>{children}</SheetTrigger>;
    }

    return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
}

export function ModalDrawerContent({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <SheetContent
                side="bottom"
                onInteractOutside={() => {}}
                className={cn(
                    // flex column + min-h-0 so nested flex-1 (e.g. campus map) can fill the sheet on mobile.
                    // Default overflow-y-auto; campus map / config modals pass !overflow-hidden + inner scroll — tw-merge + ! wins.
                    'inset-x-0 flex min-h-0 w-full max-w-full min-w-0 flex-col px-4 pb-8 pt-2 rounded-t-[24px] max-h-[90dvh] sm:max-h-[92vh] overflow-y-auto border-t-0 bg-background shadow-2xl [&>button]:hidden',
                    className
                )}
            >
                {/* Mobile Native Handle Indicator */}
                <div className="flex justify-center w-full py-2 mb-2 sticky top-0 bg-background z-20">
                    <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
                </div>
                {children}
            </SheetContent>
        );
    }

    return (
        <DialogContent className={cn('sm:max-w-[425px] rounded-lg', className)}>
            {children}
        </DialogContent>
    );
}

export function ModalDrawerHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <SheetHeader className={cn('text-left mb-2', className)}>{children}</SheetHeader>;
    }

    return <DialogHeader className={className}>{children}</DialogHeader>;
}

export function ModalDrawerTitle({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <SheetTitle className={className}>{children}</SheetTitle>;
    }

    return <DialogTitle className={className}>{children}</DialogTitle>;
}

export function ModalDrawerDescription({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <SheetDescription className={className}>{children}</SheetDescription>;
    }

    return <DialogDescription className={className}>{children}</DialogDescription>;
}

export function ModalDrawerFooter({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <SheetFooter className={cn('flex flex-col-reverse sm:flex-row gap-2 mt-4', className)}>{children}</SheetFooter>;
    }

    return <DialogFooter className={className}>{children}</DialogFooter>;
}
