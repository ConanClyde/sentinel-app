import * as React from 'react';
import { Bell, UserPlus, ShieldAlert, CheckCircle2, Info, Clock, Check, MoreHorizontal, Trash2, ClipboardCheck, AlertTriangle, UserCheck, ShieldCheck, Mail, LogIn } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
    ModalDrawer,
    ModalDrawerContent,
    ModalDrawerHeader,
    ModalDrawerTitle,
    ModalDrawerTrigger,
    ModalDrawerDescription,
} from '@/components/modal-drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SharedData, User } from '@/types';

interface Notification {
    id: number;
    title: string;
    description: string;
    link: string | null;
    created_at: string;
    created_at_full: string;
    is_read: boolean;
    type: 'registration' | 'approval' | 'violation' | 'sticker' | 'system' | 'success' | 'alert';
    icon: string;
    color: string;
}

export function NotificationDropdown() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User;
    const userId = user?.id;
    
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [open, setOpen] = React.useState(false);
    const [showHistory, setShowHistory] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const isMobile = useIsMobile();
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Fetch notifications from API
    const fetchNotifications = React.useCallback(async (unreadOnly = false) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/notifications${unreadOnly ? '?unread_only=true' : ''}`);
            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load notifications when dropdown opens
    React.useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open, fetchNotifications]);

    // Listen for real-time notifications via Pusher
    React.useEffect(() => {
        if (userId && window.Echo) {
            window.Echo.private(`App.Models.User.${userId}`)
                .listen('NotificationCreated', (e: any) => {
                    // Add new notification to the list
                    setNotifications(prev => [e, ...prev]);
                    
                    // Show toast notification
                    console.log('New notification received:', e.title);
                });
        }

        return () => {
            if (userId && window.Echo) {
                window.Echo.leave(`App.Models.User.${userId}`);
            }
        };
    }, [userId]);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            router.reload({ only: ['unreadNotificationCount'] });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.visit(notification.link);
            setOpen(false);
        }
    };

    const getIcon = (type: Notification['type'], icon: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            UserPlus: <UserPlus className="h-4 w-4 text-blue-500" />,
            ClipboardCheck: <ClipboardCheck className="h-4 w-4 text-amber-500" />,
            ShieldCheck: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
            CheckCircle2: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            ShieldAlert: <ShieldAlert className="h-4 w-4 text-red-500" />,
            AlertTriangle: <AlertTriangle className="h-4 w-4 text-red-500" />,
            Tag: <Bell className="h-4 w-4 text-purple-500" />,
            Bell: <Bell className="h-4 w-4" />,
        };
        return iconMap[icon] || <Bell className="h-4 w-4" />;
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between px-4 py-2 border-b">
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-[10px] font-medium text-primary hover:bg-transparent"
                    onClick={(e) => markAllAsRead(e)}
                >
                    Mark all read
                </Button>
            )}
        </div>
    );

    const renderList = (height = "400px") => (
        <ScrollArea className="w-full" style={{ height }}>
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-50 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">No notifications</p>
                    <p className="text-xs">Your system activity will appear here.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id}
                            className={cn(
                                "flex gap-3 px-4 py-3 cursor-pointer transition-colors relative group border-b border-border/10 last:border-0",
                                isMobile ? "active:bg-muted/50" : "hover:bg-muted/50",
                                !notification.is_read && "bg-primary/5"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="mt-0.5 shrink-0">
                                {getIcon(notification.type, notification.icon)}
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={cn(
                                        "text-sm font-medium leading-none truncate",
                                        !notification.is_read ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {notification.title}
                                    </span>
                                    {!notification.is_read && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-normal mb-1">
                                    {notification.description}
                                </p>
                                <span className={cn(
                                    "text-[10px] font-normal",
                                    !notification.is_read ? "text-primary/70 font-semibold" : "text-muted-foreground/60"
                                )}>
                                    {notification.created_at}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 z-10"
                                onClick={(e) => deleteNotification(e, notification.id)}
                            >
                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
    );

    const trigger = (
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-background"></span>
                </span>
            )}
            <span className="sr-only">Notifications</span>
        </Button>
    );

    return (
        <>
            {/* Notification Dropdown/Drawer Trigger */}
            {isMobile ? (
                <ModalDrawer open={open} onOpenChange={setOpen}>
                    <ModalDrawerTrigger asChild>
                        {trigger}
                    </ModalDrawerTrigger>
                    <ModalDrawerContent className="p-0">
                        <ModalDrawerHeader className="px-5 pt-5 pb-0 text-left border-b">
                            <div className="flex items-center justify-between mb-2">
                                <ModalDrawerTitle className="text-base font-semibold">
                                    Notifications
                                </ModalDrawerTitle>
                                {unreadCount > 0 && (
                                    <Button 
                                        size="sm" 
                                        variant="ghost"
                                        className="h-auto p-0 text-xs font-semibold text-primary"
                                        onClick={(e) => markAllAsRead(e)}
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                            <ModalDrawerDescription className="sr-only">
                                View your recent system notifications and security alerts.
                            </ModalDrawerDescription>
                        </ModalDrawerHeader>
                        {renderList("60vh")}
                        <div className="p-4 bg-background border-t">
                            <Button variant="ghost" className="w-full text-sm font-medium h-11 text-muted-foreground" onClick={() => setOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </ModalDrawerContent>
                </ModalDrawer>
            ) : (
                <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
                    <DropdownMenuTrigger asChild>
                        {trigger}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-lg border">
                        {renderHeader()}
                        {renderList("400px")}
                        <DropdownMenuSeparator className="m-0" />
                        <div className="p-2">
                            <Button 
                                variant="ghost" 
                                className="w-full h-8 text-xs font-medium text-muted-foreground"
                                onClick={() => {
                                    setOpen(false);
                                    setShowHistory(true);
                                }}
                            >
                                View all history
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Notification History Modal (Desktop) / Drawer (Mobile) */}
            <ModalDrawer open={showHistory} onOpenChange={setShowHistory}>
                <ModalDrawerContent className={cn(isMobile ? "p-0" : "sm:max-w-3xl")}>
                    <ModalDrawerHeader className={cn(isMobile ? "px-5 pt-7 pb-2" : "px-0 pb-4")}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:block">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <ModalDrawerTitle className="text-xl font-bold tracking-tight">Notification History</ModalDrawerTitle>
                                <ModalDrawerDescription className="text-sm text-muted-foreground mt-0.5">
                                    Browsing all your comprehensive system activity and security audit logs.
                                </ModalDrawerDescription>
                            </div>
                        </div>
                    </ModalDrawerHeader>
                    
                    <div className={cn("border rounded-xl bg-card/20 overflow-hidden", isMobile && "rounded-none border-x-0 border-t-0")}>
                        {renderList(isMobile ? "65vh" : "320px")}
                    </div>

                    {!isMobile && (
                        <div className="flex justify-between items-center mt-6">
                            <p className="text-xs text-muted-foreground font-medium">
                                Showing <span className="text-foreground font-bold">{notifications.length}</span> recorded notifications
                            </p>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setShowHistory(false)}>
                                    Cancel
                                </Button>
                                {unreadCount > 0 && (
                                    <Button onClick={(e) => markAllAsRead(e)}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Clear History Unread
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {isMobile && (
                        <div className="p-4 bg-background border-t">
                            <Button variant="outline" className="w-full font-bold h-11" onClick={() => setShowHistory(false)}>
                                Close History
                            </Button>
                        </div>
                    )}
                </ModalDrawerContent>
            </ModalDrawer>
        </>
    );
}
