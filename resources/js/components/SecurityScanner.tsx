import React from 'react';

interface SecurityScannerProps {
    className?: string;
}

export default function SecurityScanner({ className = '' }: SecurityScannerProps) {
    return (
        <div className={`relative aspect-square w-full max-w-md overflow-hidden rounded-xl border border-border bg-black/5 dark:bg-white/5 backdrop-blur-sm ${className}`}>
            {/* Background Grid */}
            <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Scanning Line */}
            <div className="animate-scanner-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

            {/* Central Target Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48 lg:h-64 lg:w-64">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-emerald-500" />
                    <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-emerald-500" />
                    <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-emerald-500" />
                    <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-emerald-500" />
                    
                    {/* Pulsing Shield Icon or Circle */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                         <svg 
                            className="animate-scanner-pulse h-32 w-32 text-emerald-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1} 
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                            />
                        </svg>
                    </div>

                    {/* Meta Data Labels */}
                    <div className="absolute top-4 left-4 font-mono text-[10px] text-emerald-500/80 uppercase tracking-tighter">
                        Sys.Sentinel.Active
                    </div>
                    <div className="absolute bottom-4 right-4 font-mono text-[10px] text-emerald-500/80 uppercase tracking-tighter">
                        Scan.Auth.Verify
                    </div>
                </div>
            </div>

            {/* Random Data Stream Overlay (Simple text bits) */}
            <div className="absolute bottom-6 left-6 font-mono text-[10px] text-muted-foreground/40 space-y-1">
                <p>LAT: 16.6159° N</p>
                <p>LNG: 120.3209° E</p>
                <p>SIGNAL: STABLE</p>
            </div>
            
            <div className="absolute top-6 right-6 font-mono text-[10px] text-muted-foreground/40 text-right">
                <p>V-ID: AUTO_SCAN</p>
                <p className="animate-pulse text-emerald-500/60 font-medium">READY</p>
            </div>
        </div>
    );
}
