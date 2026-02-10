"use client";

import { urlFor } from "@/sanity/lib/image";

interface UserBannerProps {
    user: any;
    isOwner: boolean;
}

export default function UserBanner({ user, isOwner }: UserBannerProps) {
    const resolveBannerUrl = (image: any) => {
        if (!image) return null;
        if (typeof image === 'string') return image;
        if (image?.asset?.url) return image.asset.url;
        try {
            return urlFor(image).width(1200).url();
        } catch (e) {
            return null;
        }
    };

    const bannerUrl = resolveBannerUrl(user.bannerImage);

    return (
        <div
            className="absolute top-0 left-0 w-full h-[60vh] md:h-[600px] overflow-hidden group z-0"
            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
        >
            {bannerUrl ? (
                <img
                    src={bannerUrl}
                    alt={`${user.fullName}'s banner`}
                    className="w-full h-full object-cover opacity-50 md:opacity-100"
                />
            ) : (
                <div className="w-full h-full bg-slate-900 relative">
                    <img
                        src="/default-banner.png"
                        alt="Default Banner"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
    );
}
