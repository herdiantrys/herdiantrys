"use client";

import { useProfileColor } from "@/components/Profile/ProfileColorContext";
import { ReactNode } from "react";

export default function ProfilePageWrapper({ children, customBackground }: { children: ReactNode, customBackground?: string | null }) {
    const { color } = useProfileColor();

    const isCustomImage = customBackground?.startsWith('http') || customBackground?.startsWith('blob');

    return (
        <div
            className={`min-h-screen pb-10 relative transition-colors duration-500 ${!isCustomImage ? 'bg-dots-pattern' : ''}`}
            style={{
                backgroundColor: color || undefined,
                backgroundImage: isCustomImage ? `url(${customBackground})` : undefined,
                backgroundSize: isCustomImage ? 'cover' : undefined,
                backgroundPosition: isCustomImage ? 'center' : undefined,
                backgroundAttachment: isCustomImage ? 'fixed' : undefined
            }}
        >
            {(color || isCustomImage) && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/50 z-0 pointer-events-none transition-colors duration-500" />
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
