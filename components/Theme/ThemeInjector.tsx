"use client";

import { useEffect } from "react";
import { ThemeConfig } from "@/lib/types/theme";
import { applyColorRule603010 } from "@/lib/theme-color-rule";

function loadGoogleFont(family: string) {
    if (!family || typeof document === "undefined") return;

    const id = `gfont-${family.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s/g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
}

const hexToHsl = (hex: string) => {
    let r = 0;
    let g = 0;
    let b = 0;

    if (hex.length === 4) {
        r = parseInt(`0x${hex[1]}${hex[1]}`);
        g = parseInt(`0x${hex[2]}${hex[2]}`);
        b = parseInt(`0x${hex[3]}${hex[3]}`);
    } else if (hex.length === 7) {
        r = parseInt(`0x${hex[1]}${hex[2]}`);
        g = parseInt(`0x${hex[3]}${hex[4]}`);
        b = parseInt(`0x${hex[5]}${hex[6]}`);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    return {
        h,
        s: +(s * 100).toFixed(1),
        l: +(l * 100).toFixed(1),
    };
};

const hexToRgbString = (hex: string) => {
    let r = 195;
    let g = 245;
    let b = 255;

    if (hex.length === 4) {
        r = parseInt(`0x${hex[1]}${hex[1]}`);
        g = parseInt(`0x${hex[2]}${hex[2]}`);
        b = parseInt(`0x${hex[3]}${hex[3]}`);
    } else if (hex.length === 7) {
        r = parseInt(`0x${hex[1]}${hex[2]}`);
        g = parseInt(`0x${hex[3]}${hex[4]}`);
        b = parseInt(`0x${hex[5]}${hex[6]}`);
    }

    return `${r}, ${g}, ${b}`;
};

const calculateGradient = (start: string | undefined, end: string | undefined, baseAccent: string) => {
    if (start && end) {
        return { prev: start, next: end };
    }

    if (!baseAccent) {
        return { prev: "#c3f5ff", next: "#00e5ff" };
    }

    const hsl = hexToHsl(baseAccent);
    return {
        prev: `hsl(${(hsl.h - 5 + 360) % 360}, ${hsl.s}%, ${hsl.l}%)`,
        next: `hsl(${(hsl.h + 5) % 360}, ${hsl.s}%, ${hsl.l}%)`,
    };
};

export default function ThemeInjector({ theme }: { theme: ThemeConfig }) {
    useEffect(() => {
        if (!theme) return;

        const resolvedTheme = applyColorRule603010(theme);
        const root = document.documentElement;

        const setProp = (name: string, value: string | number | undefined) => {
            if (value !== undefined) {
                root.style.setProperty(name, String(value));
            }
        };

        const updateThemeVariables = (t: ThemeConfig) => {
            setProp("--theme-light-primary", t.primary);
            setProp("--theme-secondary", t.secondary);
            setProp("--theme-secondary-rgb", hexToRgbString(t.secondary || "#c3f5ff"));
            setProp("--theme-dark-primary", t.darkPrimary);
            setProp("--theme-dark-secondary", t.darkSecondary || t.secondary);
            setProp("--theme-dark-secondary-rgb", hexToRgbString(t.darkSecondary || t.secondary || "#c3f5ff"));
            setProp("--theme-accent", t.accent);
            setProp("--theme-dark-accent", t.darkAccent || t.accent);
            setProp("--theme-button", t.button || t.accent);
            setProp("--theme-dark-button", t.darkButton || t.button || t.darkAccent || t.accent);
            setProp("--theme-button-text", t.buttonText || "#081019");
            setProp("--theme-dark-button-text", t.darkButtonText || t.buttonText || "#081019");
            setProp("--theme-link", t.link || t.accent);
            setProp("--theme-dark-link", t.darkLink || t.darkAccent || t.accent);
            setProp("--theme-card", t.card || "#f6f9fd");
            setProp("--theme-dark-card", t.darkCard || t.card || "#11192c");
            setProp("--theme-card-text", t.cardText || "#10213d");
            setProp("--theme-dark-card-text", t.darkCardText || t.cardText || "#dae2fd");

            setProp("--radius", `${t.radius || 1.25}rem`);
            setProp("--glass-blur", `${t.glassBlur || 20}px`);
            setProp("--glass-opacity", `${t.glassOpacity || 0.26}`);
            setProp("--glass-saturation", `${t.glassSaturation || 180}%`);
            setProp("font-size", `${(t.scale || 1) * 100}%`);

            setProp("--theme-sidebar-bg", t.sidebarBg || "#f2f6fc");
            setProp("--theme-sidebar-fg", t.sidebarFg || "#10213d");
            setProp("--theme-sidebar-border", t.sidebarBorder || "#d9e2ee");
            setProp("--theme-sidebar-accent", t.sidebarAccent || t.accent || "#c3f5ff");
            setProp("--theme-sidebar-active", t.sidebarActive || "#e8eff8");
            setProp("--theme-dark-sidebar-bg", t.darkSidebarBg || "#091224");
            setProp("--theme-dark-sidebar-fg", t.darkSidebarFg || "#dae2fd");
            setProp("--theme-dark-sidebar-border", t.darkSidebarBorder || "#2b3450");
            setProp("--theme-dark-sidebar-accent", t.darkSidebarAccent || t.darkAccent || t.accent || "#c3f5ff");
            setProp("--theme-dark-sidebar-active", t.darkSidebarActive || "#111a2f");

            const lightGradient = calculateGradient(t.accentGradientStart, t.accentGradientEnd, t.accent);
            setProp("--theme-accent-prev", lightGradient.prev);
            setProp("--theme-accent-next", lightGradient.next);

            const lightButtonGradient = calculateGradient(
                t.buttonGradientStart || t.button,
                t.buttonGradientEnd || t.accent,
                t.button || t.accent,
            );
            setProp("--theme-button-prev", lightButtonGradient.prev);
            setProp("--theme-button-next", lightButtonGradient.next);

            const darkGradient = calculateGradient(
                t.darkAccentGradientStart,
                t.darkAccentGradientEnd,
                t.darkAccent || t.accent,
            );
            setProp("--theme-dark-accent-prev", darkGradient.prev);
            setProp("--theme-dark-accent-next", darkGradient.next);

            const darkButtonGradient = calculateGradient(
                t.darkButtonGradientStart || t.darkButton || t.button,
                t.darkButtonGradientEnd || t.darkAccent || t.accent,
                t.darkButton || t.button || t.darkAccent || t.accent,
            );
            setProp("--theme-dark-button-prev", darkButtonGradient.prev);
            setProp("--theme-dark-button-next", darkButtonGradient.next);

            const heading = t.fontHeading || "Space Grotesk";
            const body = t.fontBody || "Inter";
            const mono = t.fontMono || "JetBrains Mono";

            [heading, body, mono]
                .filter((font, index, arr) => arr.indexOf(font) === index)
                .forEach(loadGoogleFont);

            setProp("--font-heading-family", `'${heading}', var(--font-heading-default), ui-sans-serif, sans-serif`);
            setProp("--font-body-family", `'${body}', var(--font-body-default), ui-sans-serif, sans-serif`);
            setProp("--font-mono-family", `'${mono}', var(--font-mono-default), ui-monospace, monospace`);
        };

        updateThemeVariables(resolvedTheme);

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "THEME_PREVIEW_UPDATE" && event.data?.theme) {
                updateThemeVariables(applyColorRule603010(event.data.theme as ThemeConfig));
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [theme]);

    return null;
}
