"use client";

import { resolveUserBannerMedia } from "@/lib/user-banner";

interface UserBannerProps {
    user: any;
    isOwner: boolean;
}

export default function UserBanner({ user }: UserBannerProps) {
    const bannerMedia = resolveUserBannerMedia(user);

    return (
        <div
            className="absolute top-0 left-0 w-full h-[60vh] md:h-[600px] overflow-hidden group z-0"
            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
        >
            {bannerMedia.kind === "video" ? (
                <video
                    src={bannerMedia.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-50 md:opacity-100"
                />
            ) : (
                <img
                    src={bannerMedia.src}
                    alt={bannerMedia.alt}
                    className="w-full h-full object-cover opacity-50 md:opacity-100"
                    onError={(event) => {
                        event.currentTarget.src = "/images/default-banner.jpg";
                    }}
                />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 dark:from-black/50 to-transparent pointer-events-none" />
        </div>
    );
}
