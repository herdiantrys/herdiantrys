import {
    DEFAULT_MEDIA_PLACEHOLDER,
    extractAssetUrl,
    resolveAssetUrl,
    toServedAssetUrl,
} from "@/lib/media";

type BannerMedia = {
    kind: "image" | "video";
    src: string;
    alt: string;
    isFallback: boolean;
};

type BannerUser = {
    fullName?: string | null;
    bannerImage?: unknown;
    bannerVideo?: unknown;
    equippedBanner?: string | null;
};

export function resolveUserBannerMedia(user: BannerUser | null | undefined): BannerMedia {
    const fullName = typeof user?.fullName === "string" && user.fullName.trim()
        ? user.fullName.trim()
        : "User";
    const alt = `${fullName}'s banner`;

    const bannerVideoUrl = extractAssetUrl(user?.bannerVideo);
    if (user?.equippedBanner === "custom-video" && bannerVideoUrl) {
        return {
            kind: "video",
            src: toServedAssetUrl(bannerVideoUrl),
            alt,
            isFallback: false,
        };
    }

    const bannerImageUrl = extractAssetUrl(user?.bannerImage);
    if (bannerImageUrl) {
        return {
            kind: "image",
            src: resolveAssetUrl(bannerImageUrl),
            alt,
            isFallback: false,
        };
    }

    return {
        kind: "image",
        src: DEFAULT_MEDIA_PLACEHOLDER,
        alt: "Default Banner",
        isFallback: true,
    };
}
