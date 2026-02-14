"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarWithEffectProps {
    src?: string | null;
    alt: string;
    size?: number; // Size in pixels
    effect?: string | null;
    frame?: string | null;
    background?: string | null;
    className?: string;
    profileColor?: string | null;
    frameColor?: string | null;
}

export default function AvatarWithEffect({
    src,
    alt,
    size = 40,
    effect,
    frame,
    background,
    className,
    profileColor,
    frameColor
}: AvatarWithEffectProps) {
    const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || "User")}&background=random`;
    const imageSrc = src || defaultImage;

    // Resolve what to show
    const activeBackground = background || effect;
    const activeFrame = frame;

    const isCustomBg = (activeBackground === 'custom-color');
    const isCustomFrame = (activeFrame === 'custom-color');

    return (
        <div
            className={cn("relative rounded-full shrink-0 group", className)}
            style={{ width: size, height: size }}
        >
            {/* Background Glow Layer */}
            {activeBackground && (
                <div
                    className={cn(
                        `absolute -inset-1 rounded-full opacity-40 blur-md group-hover:opacity-60 transition-opacity duration-500`,
                        !isCustomBg && `bg-gradient-to-br ${activeBackground}`
                    )}
                    style={isCustomBg && profileColor ? { background: `linear-gradient(135deg, ${profileColor}, ${profileColor})` } : {}}
                />
            )}

            {/* Custom Frame Glow Layer (Layered on top of bg glow) */}
            {isCustomFrame && frameColor && (
                <div
                    className="absolute -inset-1 rounded-full opacity-40 blur-md group-hover:opacity-60 transition-opacity duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${frameColor}, ${frameColor})`,
                        boxShadow: `0 0 12px ${frameColor}`
                    }}
                />
            )}

            <div
                className={cn(
                    "w-full h-full rounded-full overflow-hidden relative z-10 flex items-center justify-center",
                    // If standard background gradient
                    (activeBackground && !isCustomBg) ? `p-[2px] bg-gradient-to-br ${activeBackground}` : "",
                    // If standard frame class (not URL)
                    (activeFrame && !activeFrame.startsWith('http') && !activeFrame.startsWith('/') && !isCustomFrame) ? `p-[2px] bg-gradient-to-br ${activeFrame}` : "",
                    // Border if nothing is equipped
                    (!activeBackground && !activeFrame) && "border border-white/10"
                )}
                style={{
                    ...(isCustomBg && profileColor ? { background: `linear-gradient(135deg, ${profileColor}, ${profileColor})`, padding: '2px' } : {}),
                    ...(isCustomFrame && frameColor ? { boxShadow: `inset 0 0 0 2px ${frameColor}`, padding: '2px' } : {})
                }}
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
                        alt={alt || "Avatar"}
                        fill
                        className="object-cover"
                        sizes={`${size}px`}
                    />
                </div>
            </div>
        </div>
    );
}
