import React from 'react';

interface PixelBadgeProps {
    badge: {
        name: string;
        icon: string;
        description?: string;
        xpReward?: number;
        runeReward?: number;
    };
    size?: 'sm' | 'md' | 'lg';
}

export default function PixelBadge({ badge, size = 'md' }: PixelBadgeProps) {
    const sizeClasses = {
        sm: 'w-10 h-10 text-lg',
        md: 'w-14 h-14 text-2xl',
        lg: 'w-20 h-20 text-4xl'
    };

    return (
        <div className="group relative inline-block m-1">
            {/* 8-bit Border Container */}
            <div
                className={`
                    ${sizeClasses[size]} 
                    bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center
                    font-mono text-slate-800 dark:text-white cursor-default select-none
                    transition-transform active:scale-95 active:translate-y-1
                `}
                style={{
                    // Creates a 2px hard pixel border without blur
                    boxShadow: `
                        -2px 0 0 0 black,
                        2px 0 0 0 black,
                        0 -2px 0 0 black,
                        0 2px 0 0 black,
                        -2px -2px 0 0 black,
                        -2px 2px 0 0 black,
                        2px -2px 0 0 black,
                        2px 2px 0 0 black,
                        inset 2px 2px 0 0 rgba(255,255,255,0.2),
                        inset -2px -2px 0 0 rgba(0,0,0,0.5)
                    `,
                    imageRendering: 'pixelated'
                }}
            >
                {/* Checkered Background Pattern */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                        backgroundSize: '4px 4px',
                        backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                    }}
                />

                {/* Icon */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {badge.icon && (badge.icon.startsWith('/') || badge.icon.startsWith('http')) ? (
                        <img
                            src={badge.icon}
                            alt={badge.name}
                            className="w-[70%] h-[70%] object-contain"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    ) : (
                        <span className="drop-shadow-md filter contrast-125">
                            {badge.icon || "🛡️"}
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
}
