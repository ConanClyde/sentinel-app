export default function HeadingSmall({ title, description }: { title: string; description?: string }) {
    return (
        <header className="flex flex-col gap-1.5">
            <h3 className="text-xl font-black tracking-tighter text-foreground uppercase">{title}</h3>
            {description && <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-lg">{description}</p>}
        </header>
    );
}
