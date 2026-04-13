import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';

interface AdminRegistrationProps {
    role?: string;
}

export function AdminRegistration({ role: roleProp }: AdminRegistrationProps) {
    const role = roleProp || 'administrator';
    const [registered, setRegistered] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        role,
        first_name: '',
        middle_name: '',
        surname: '',
        name_extension: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const passwordStrength = () => {
        const p = data.password;
        if (!p) return { strength: 0, label: '', color: '' };
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        if (s <= 1) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (s === 2) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (s === 3) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };
    const { strength, label, color } = passwordStrength();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.email.trim() || !data.email.includes('@')) { toast.error('Please enter a valid email'); return; }
        if (data.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        if (!/[A-Z]/.test(data.password)) { toast.error('Password must have at least 1 uppercase letter'); return; }
        if (!/[0-9]/.test(data.password)) { toast.error('Password must have at least 1 number'); return; }
        if (data.password !== data.password_confirmation) { toast.error('Passwords do not match'); return; }

        post(route('admin.registration.store'), {
            onSuccess: () => setRegistered(true),
        });
    };

    const handleRegisterAgain = () => {
        setRegistered(false);
        reset();
    };

    if (registered) {
        return (
            <div className="space-y-6 text-center">
                <div className="py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
                    <p className="text-muted-foreground mb-6">The administrator has been registered successfully.</p>
                    <Button type="button" onClick={handleRegisterAgain}>Register Another Administrator</Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="Juan" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="surname">Surname</Label>
                    <Input id="surname" value={data.surname} onChange={(e) => setData('surname', e.target.value)} placeholder="Dela Cruz" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="middle_name">Middle Name <span className="text-muted-foreground">(optional)</span></Label>
                    <Input id="middle_name" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} placeholder="Santos" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name_extension">Name Extension <span className="text-muted-foreground">(optional)</span></Label>
                    <Select value={data.name_extension || undefined} onValueChange={(value) => setData('name_extension', value === 'none' ? '' : value)}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)]">
                            <SelectItem value="none" className="pl-3">None</SelectItem>
                            <SelectItem value="Jr." className="pl-3">Jr.</SelectItem>
                            <SelectItem value="Sr." className="pl-3">Sr.</SelectItem>
                            <SelectItem value="I" className="pl-3">I</SelectItem>
                            <SelectItem value="II" className="pl-3">II</SelectItem>
                            <SelectItem value="III" className="pl-3">III</SelectItem>
                            <SelectItem value="IV" className="pl-3">IV</SelectItem>
                            <SelectItem value="V" className="pl-3">V</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <h3 className="font-semibold text-lg">Account Credentials</h3>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="juan@example.com" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput id="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Enter password" required />
                    {data.password && (
                        <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${strength}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters with 1 uppercase letter and 1 number.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <PasswordInput id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Confirm password" required />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {processing ? 'Creating...' : 'Register Administrator'}
            </Button>
        </form>
    );
}
