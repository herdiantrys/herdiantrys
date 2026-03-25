const DEFAULT_PROFILE_PICTURES = [
    "/images/profile-picture-1.png",
    "/images/profile-picture-2.png",
    "/images/profile-picture-3.png",
    "/images/profile-picture-4.png",
    "/images/profile-picture-5.png",
] as const;

const FALLBACK_PROFILE_PICTURE = DEFAULT_PROFILE_PICTURES[0];

const hashSeed = (seed: string) => {
    let hash = 0;

    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash);
};

export const getRandomDefaultProfilePicture = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_PROFILE_PICTURES.length);
    return DEFAULT_PROFILE_PICTURES[randomIndex];
};

export const getDefaultProfilePicture = (seed?: string | null) => {
    if (!seed) {
        return FALLBACK_PROFILE_PICTURE;
    }

    const normalizedSeed = seed.trim();

    if (!normalizedSeed) {
        return FALLBACK_PROFILE_PICTURE;
    }

    const index = hashSeed(normalizedSeed) % DEFAULT_PROFILE_PICTURES.length;
    return DEFAULT_PROFILE_PICTURES[index];
};

export const resolveProfilePicture = (src?: string | null, seed?: string | null) => {
    return src || getDefaultProfilePicture(seed);
};

export { DEFAULT_PROFILE_PICTURES };
