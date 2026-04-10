import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Bell, Moon, Shield, Palette, Monitor, Key, Save } from 'lucide-react';
import { useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Settings', href: route('settings') },
];

export default function SettingsPage() {
    const { appearance, updateAppearance } = useAppearance();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('password.update'), {
            onSuccess: () => {
                setPasswordDialogOpen(false);
                reset();
            },
        });
    };

    const passwordStrength = () => {
        const password = data.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 1) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (strength === 2) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (strength === 3) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const { strength, label, color } = passwordStrength();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage your preferences and account settings</p>
                </div>

                {/* Appearance */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize how the application looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Theme</label>
                            <p className="text-sm text-muted-foreground mb-3">Select your preferred theme</p>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={appearance === 'light' ? 'default' : 'outline'}
                                    size="sm"
                                    className="gap-1 h-10"
                                    onClick={() => updateAppearance('light')}
                                >
                                    <Moon className="h-4 w-4" />
                                    <span className="text-xs">Light</span>
                                </Button>
                                <Button
                                    variant={appearance === 'dark' ? 'default' : 'outline'}
                                    size="sm"
                                    className="gap-1 h-10"
                                    onClick={() => updateAppearance('dark')}
                                >
                                    <Moon className="h-4 w-4" />
                                    <span className="text-xs">Dark</span>
                                </Button>
                                <Button
                                    variant={appearance === 'system' ? 'default' : 'outline'}
                                    size="sm"
                                    className="gap-1 h-10"
                                    onClick={() => updateAppearance('system')}
                                >
                                    <Monitor className="h-4 w-4" />
                                    <span className="text-xs">System</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications" className="text-sm font-medium">
                                    Email Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive email updates about your account
                                </p>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={emailNotifications}
                                onCheckedChange={setEmailNotifications}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="push-notifications" className="text-sm font-medium">
                                    Push Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive push notifications on your device
                                </p>
                            </div>
                            <Switch
                                id="push-notifications"
                                checked={pushNotifications}
                                onCheckedChange={setPushNotifications}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Password</Label>
                                <p className="text-sm text-muted-foreground">
                                    Change your account password
                                </p>
                            </div>
                            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                        <Key className="h-4 w-4 mr-2" />
                                        Change Password
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-lg">
                                    <form onSubmit={handlePasswordSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                            <DialogDescription>
                                                Enter your current password and choose a new one.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="current_password">Current Password</Label>
                                                <PasswordInput
                                                    id="current_password"
                                                    value={data.current_password}
                                                    onChange={(e) => setData('current_password', e.target.value)}
                                                    className={errors.current_password ? 'border-red-500' : ''}
                                                />
                                                {errors.current_password && (
                                                    <p className="text-sm text-red-500">{errors.current_password}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="password">New Password</Label>
                                                <PasswordInput
                                                    id="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className={errors.password ? 'border-red-500' : ''}
                                                />
                                                {data.password && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${color}`}
                                                                style={{ width: `${strength}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{label}</span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Must be at least 8 characters with 1 uppercase letter and 1 number.
                                                </p>
                                                {errors.password && (
                                                    <p className="text-sm text-red-500">{errors.password}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                                <PasswordInput
                                                    id="password_confirmation"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="ghost" onClick={() => setPasswordDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Separator />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                Enable
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                            <Settings className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions for your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Delete Account</Label>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and data
                                </p>
                            </div>
                            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
