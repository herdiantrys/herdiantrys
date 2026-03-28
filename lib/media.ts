export const DEFAULT_MEDIA_PLACEHOLDER = "/images/default-banner.jpg";

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

export const extractAssetUrl = (value: unknown): string | null => {
    if (!value) return null;

    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }

    if (isObjectRecord(value) && typeof value.url === "string") {
        return value.url.trim() || null;
    }

    if (isObjectRecord(value) && isObjectRecord(value.asset) && typeof value.asset.url === "string") {
        return value.asset.url.trim() || null;
    }

    return null;
};

export const toServedAssetUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return DEFAULT_MEDIA_PLACEHOLDER;

    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("blob:")
    ) {
        return trimmed;
    }

    if (trimmed.startsWith("/api/media/")) {
        return trimmed;
    }

    if (trimmed.startsWith("/uploads/")) {
        return `/api/media/${trimmed.slice("/uploads/".length)}`;
    }

    if (trimmed.startsWith("uploads/")) {
        return `/api/media/${trimmed.slice("uploads/".length)}`;
    }

    if (trimmed.startsWith("/")) {
        return trimmed;
    }

    return `/${trimmed}`;
};

export const resolveAssetUrl = (value: unknown, fallback = DEFAULT_MEDIA_PLACEHOLDER): string => {
    const extracted = extractAssetUrl(value);
    return extracted ? toServedAssetUrl(extracted) : fallback;
};
