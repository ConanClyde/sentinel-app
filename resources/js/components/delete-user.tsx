import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';

// Components...
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/components/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6 pt-8 border-t border-muted/30">
            <HeadingSmall title="Security Zone: Delete Account" description="Deleting your account is a permanent action that removes all associated vehicle registries and credentials." />

            <div className="group relative space-y-4 rounded-xl border border-red-200/50 bg-red-50/50 p-6 dark:border-red-500/10 dark:bg-red-500/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <X className="h-24 w-24 text-red-500" />
                </div>

                <div className="relative space-y-2">
                    <p className="font-black uppercase tracking-[0.2em] text-xs text-red-600 dark:text-red-500 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Critical Security Alert
                    </p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-md">
                        Once your account is purged, all of its digital assets, verified IDs, and registration history will be
                        <span className="text-foreground font-bold italic ml-1 underline decoration-red-500/30">deleted forever</span>.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="h-10 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] text-white">
                            Initialize Account Purge
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight text-red-600 flex items-center gap-2">
                                <AlertCircle className="h-6 w-6" />
                                Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium">
                                To proceed with the purge, please authenticate your session by entering your current password below.
                            </DialogDescription>
                        </DialogHeader>
                        <form className="space-y-6 pt-4" onSubmit={deleteUser}>
                            <div className="grid gap-3">
                                <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                    Account Password
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter password to confirm"
                                    className="h-12 bg-muted/30 border-muted/60 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl"
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-3 sm:gap-0 sm:flex-row flex-col">
                                <DialogClose asChild>
                                    <Button variant="ghost" onClick={closeModal} className="font-bold rounded-xl h-11">
                                        Abort Request
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing} className="font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl text-white" asChild>
                                    <button type="submit">Execute Purge</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
