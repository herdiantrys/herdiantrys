import { DEFAULT_THEME, type ThemeConfig } from "@/lib/types/theme";

type Rgb = {
    r: number;
    g: number;
    b: number;
};

const LIGHT_TEXT = "#e6edff";
const DARK_TEXT = "#081019";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeHex = (hex: string | undefined, fallback: string) => {
    if (!hex) return fallback;

    const value = hex.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
        return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
    }

    return fallback;
};

const hexToRgb = (hex: string): Rgb => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
});

const rgbToHex = ({ r, g, b }: Rgb) =>
    `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("")}`;

const mixColors = (base: string, mix: string, mixAmount: number) => {
    const amount = clamp(mixAmount, 0, 1);
    const baseRgb = hexToRgb(base);
    const mixRgb = hexToRgb(mix);

    return rgbToHex({
        r: baseRgb.r + (mixRgb.r - baseRgb.r) * amount,
        g: baseRgb.g + (mixRgb.g - baseRgb.g) * amount,
        b: baseRgb.b + (mixRgb.b - baseRgb.b) * amount,
    });
};

const relativeLuminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const toLinear = (channel: number) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };

    const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const getReadableText = (background: string) => {
    return relativeLuminance(background) > 0.44 ? DARK_TEXT : LIGHT_TEXT;
};

const isLightFoundation = (hex: string) => relativeLuminance(hex) > 0.52;

const deriveModePalette = (primary: string, secondary: string, accent: string, preferredMode?: "light" | "dark") => {
    const safePrimary = normalizeHex(primary, DEFAULT_THEME.primary);
    const safeSecondary = normalizeHex(secondary, DEFAULT_THEME.secondary);
    const safeAccent = normalizeHex(accent, DEFAULT_THEME.accent);

    const isLight = preferredMode ? preferredMode === "light" : isLightFoundation(safePrimary);

    const supportSurface = isLight
        ? mixColors(mixColors(safePrimary, safeSecondary, 0.08), "#ffffff", 0.24)
        : mixColors(safePrimary, safeSecondary, 0.14);
    const raisedSurface = isLight
        ? mixColors(mixColors(supportSurface, "#ffffff", 0.18), safeAccent, 0.03)
        : mixColors(supportSurface, safeSecondary, 0.18);
    const sidebarBackground = isLight
        ? mixColors(mixColors(safePrimary, "#ffffff", 0.08), safeSecondary, 0.04)
        : mixColors(safePrimary, safeSecondary, 0.1);
    const sidebarActive = isLight
        ? mixColors(sidebarBackground, safeAccent, 0.08)
        : mixColors(sidebarBackground, safeSecondary, 0.18);
    const sidebarBorder = isLight
        ? mixColors(sidebarBackground, safeAccent, 0.16)
        : mixColors(sidebarBackground, safeSecondary, 0.28);
    const link = isLight
        ? mixColors(safeAccent, safeSecondary, 0.22)
        : mixColors(safeSecondary, safeAccent, 0.3);
    const button = isLight
        ? mixColors(safeSecondary, safeAccent, 0.34)
        : mixColors(safeSecondary, safeAccent, 0.24);
    const buttonGradientStart = isLight
        ? mixColors(safeSecondary, "#ffffff", 0.14)
        : mixColors(safeSecondary, "#ffffff", 0.06);
    const buttonGradientEnd = isLight
        ? mixColors(safeAccent, safeSecondary, 0.08)
        : safeAccent;

    return {
        primary: safePrimary,
        secondary: safeSecondary,
        accent: safeAccent,
        button,
        buttonGradientStart,
        buttonGradientEnd,
        buttonText: getReadableText(button),
        link,
        card: supportSurface,
        cardText: getReadableText(supportSurface),
        sidebarBg: sidebarBackground,
        sidebarFg: getReadableText(sidebarBackground),
        sidebarBorder,
        sidebarAccent: safeSecondary,
        sidebarActive,
        accentGradientStart: isLight
            ? mixColors(safeSecondary, "#ffffff", 0.12)
            : mixColors(safeSecondary, "#ffffff", 0.04),
        accentGradientEnd: isLight
            ? mixColors(safeAccent, safeSecondary, 0.04)
            : safeAccent,
        surfaceHigh: raisedSurface,
    };
};

export const applyColorRule603010 = (inputTheme: ThemeConfig): ThemeConfig => {
    const merged = {
        ...DEFAULT_THEME,
        ...inputTheme,
        useColorRule603010: inputTheme.useColorRule603010 ?? DEFAULT_THEME.useColorRule603010 ?? true,
        darkPrimary: inputTheme.darkPrimary ?? DEFAULT_THEME.darkPrimary,
        darkSecondary: inputTheme.darkSecondary ?? inputTheme.secondary ?? DEFAULT_THEME.darkSecondary,
        darkAccent: inputTheme.darkAccent ?? inputTheme.accent ?? DEFAULT_THEME.darkAccent,
    };

    if (!merged.useColorRule603010) {
        return merged;
    }

    const lightPalette = deriveModePalette(merged.primary, merged.secondary, merged.accent, "light");
    const darkPalette = deriveModePalette(merged.darkPrimary, merged.darkSecondary, merged.darkAccent, "dark");

    return {
        ...merged,
        primary: lightPalette.primary,
        secondary: lightPalette.secondary,
        accent: lightPalette.accent,
        button: lightPalette.button,
        buttonGradientStart: lightPalette.buttonGradientStart,
        buttonGradientEnd: lightPalette.buttonGradientEnd,
        buttonText: lightPalette.buttonText,
        link: lightPalette.link,
        card: lightPalette.card,
        cardText: lightPalette.cardText,
        sidebarBg: lightPalette.sidebarBg,
        sidebarFg: lightPalette.sidebarFg,
        sidebarBorder: lightPalette.sidebarBorder,
        sidebarAccent: lightPalette.sidebarAccent,
        sidebarActive: lightPalette.sidebarActive,
        accentGradientStart: lightPalette.accentGradientStart,
        accentGradientEnd: lightPalette.accentGradientEnd,
        darkPrimary: darkPalette.primary,
        darkSecondary: darkPalette.secondary,
        darkAccent: darkPalette.accent,
        darkButton: darkPalette.button,
        darkButtonGradientStart: darkPalette.buttonGradientStart,
        darkButtonGradientEnd: darkPalette.buttonGradientEnd,
        darkButtonText: darkPalette.buttonText,
        darkLink: darkPalette.link,
        darkCard: darkPalette.card,
        darkCardText: darkPalette.cardText,
        darkSidebarBg: darkPalette.sidebarBg,
        darkSidebarFg: darkPalette.sidebarFg,
        darkSidebarBorder: darkPalette.sidebarBorder,
        darkSidebarAccent: darkPalette.sidebarAccent,
        darkSidebarActive: darkPalette.sidebarActive,
        darkAccentGradientStart: darkPalette.accentGradientStart,
        darkAccentGradientEnd: darkPalette.accentGradientEnd,
    };
};
