import { FishType } from "./akuaria.shared";

// Default View (Aquarium - Swimming)
export const FISH_ASSETS: Record<FishType | string, string> = {
    // Guppy uses generic Goldfish for swimming (filled)
    "guppy": "/akuaria/B - Fresh Water/Goldfish.png",
    "goldfish": "/akuaria/B - Fresh Water/Goldfish.png", // Explicit Goldfish
    "angelfish": "/akuaria/B - Fresh Water/Angelfish.png", // Assuming filled exists, or fallback
    // Others...
    "molly": "/akuaria/B - Fresh Water/Bass.png",
    "neon_tetra": "/akuaria/B - Fresh Water/Rainbow Trout.png",
    "catfish": "/akuaria/B - Fresh Water/Catfish.png",
};

// UI View (Shop, Modal - Outline / Pixel Art Style)
export const FISH_ASSETS_UI: Record<FishType | string, string> = {
    "guppy": "/akuaria/B - Fresh Water/Goldfish Outline.png",
    "goldfish": "/akuaria/B - Fresh Water/Goldfish Outline.png",
    "angelfish": "/akuaria/B - Fresh Water/Angelfish Outline.png",
    "molly": "/akuaria/B - Fresh Water/Bass Outline.png",
    "neon_tetra": "/akuaria/B - Fresh Water/Rainbow Trout Outline.png",
    "catfish": "/akuaria/B - Fresh Water/Catfish Outline.png",
};

export function getFishAsset(type: string): string | null {
    return FISH_ASSETS[type] || FISH_ASSETS_UI[type] || null; // Fallback to UI if no filled version
}

export function getFishUIAsset(type: string): string | null {
    return FISH_ASSETS_UI[type] || FISH_ASSETS[type] || null; // Fallback to filled if no UI version
}
