"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarWithEffectProps {
    src?: string | null;
    alt: string;
    size?: number; // Size in pixels
    effect?: string | null;
    className?: string;
}

export default function AvatarWithEffect({ src, alt, size = 40, effect, frame, background, className }: { src?: string | null, alt: string, size?: number, effect?: string | null, frame?: string | null, background?: string | null, className?: string }) {
    const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || "User")}&background=random`;
    const imageSrc = src || defaultImage;

    // Resolve what to show
    const activeBackground = background || effect;
    const activeFrame = frame;

    return (
        <div
            className={cn("relative rounded-full shrink-0 group", className)}
            style={{ width: size, height: size }}
        >
            {/* Glow Effect Layer (Background) */}
            {activeBackground && (
                <div
                    className={`absolute -inset-1 rounded-full bg-gradient-to-br ${activeBackground} opacity-40 blur-md group-hover:opacity-60 transition-opacity duration-500`}
                />
            )}

            <div
                className={cn(
                    "w-full h-full rounded-full overflow-hidden relative z-10",
                    activeBackground && !activeFrame ? `p-[2px] bg-gradient-to-br ${activeBackground}` : "",
                    // If frame is active, we might not want padding/border from background, OR we might want to hide it if frame covers it.
                    // But usually background is color, frame is overlay.
                    // If frame is a gradient string, it mimics background.
                    (activeFrame && !(activeFrame.startsWith('http') || activeFrame.startsWith('/'))) ? `p-[2px] bg-gradient-to-br ${activeFrame}` : "",
                    (!activeBackground && !activeFrame) && "border border-white/10"
                )}
            >
                {/* Frame Overlay (if strictly an image URL) */}
                {activeFrame && (activeFrame.startsWith('http') || activeFrame.startsWith('/')) && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <img
                            src={activeFrame}
                            alt="Frame"
                            className="w-full h-full object-cover scale-110"
                        />
                    </div>
                )}

                <div className="w-full h-full rounded-full overflow-hidden bg-black/20 relative z-10">
                    <Image
                        src={imageSrc}
                        alt={alt}
                        fill
                        className="object-cover"
                        sizes={`${size}px`}
                    />
                </div>
            </div>
        </div>
    );
}
