import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({ children, title, description, backHref, showHomeIcon, progress, ...props }: { children: React.ReactNode; title: string; description: string; backHref?: string; showHomeIcon?: boolean; progress?: number }) {
    return (
        <AuthLayoutTemplate title={title} description={description} backHref={backHref} showHomeIcon={showHomeIcon} progress={progress} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
