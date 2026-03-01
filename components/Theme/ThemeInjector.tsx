"use client";

import { useEffect } from "react";
import { ThemeConfig } from "@/lib/types/theme";

// Load a Google Font dynamically via a <link> tag
function loadGoogleFont(family: string) {
    if (!family || typeof document === "undefined") return;
    const id = `gfont-${family.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return; // already loaded
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s/g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
}

export default function ThemeInjector({ theme }: { theme: ThemeConfig }) {
    useEffect(() => {
        if (!theme) return;

        const root = document.documentElement;

        const setProp = (name: string, value: string | undefined | number) => {
            if (value !== undefined) root.style.setProperty(name, String(value));
        };

        const hexToHsl = (hex: string) => {
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt("0x" + hex[1] + hex[1]);
                g = parseInt("0x" + hex[2] + hex[2]);
                b = parseInt("0x" + hex[3] + hex[3]);
            } else if (hex.length === 7) {
                r = parseInt("0x" + hex[1] + hex[2]);
                g = parseInt("0x" + hex[3] + hex[4]);
                b = parseInt("0x" + hex[5] + hex[6]);
            }
            r /= 255; g /= 255; b /= 255;
            const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
            let h = 0, s = 0, l = 0;
            if (delta === 0) h = 0;
            else if (cmax === r) h = ((g - b) / delta) % 6;
            else if (cmax === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;
            h = Math.round(h * 60);
            if (h < 0) h += 360;
            l = (cmax + cmin) / 2;
            s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
            return { h, s: +(s * 100).toFixed(1), l: +(l * 100).toFixed(1) };
        };

        const calculateGradient = (start: string | undefined, end: string | undefined, baseAccent: string) => {
            if (start && end) return { prev: start, next: end };
            if (!baseAccent) return { prev: "#14b8a6", next: "#06b6d4" };
            const hsl = hexToHsl(baseAccent);
            return {
                prev: `hsl(${(hsl.h - 5 + 360) % 360}, ${hsl.s}%, ${hsl.l}%)`,
                next: `hsl(${(hsl.h + 5) % 360}, ${hsl.s}%, ${hsl.l}%)`
            };
        };

        const updateThemeVariables = (t: ThemeConfig) => {
            setProp("--theme-light-primary", t.primary);
            setProp("--theme-dark-primary", t.darkPrimary);
            setProp("--theme-secondary", t.secondary);
            setProp("--theme-accent", t.accent);
            setProp("--theme-button", t.button || t.accent);
            setProp("--theme-button-text", t.buttonText || "#ffffff");
            setProp("--theme-link", t.link || t.accent);
            setProp("--theme-card", t.card || "#ffffff");
            setProp("--theme-card-text", t.cardText || "#1f2937");

            setProp("--radius", `${t.radius || 0.5}rem`);
            setProp("--glass-blur", `${t.glassBlur || 8}px`);
            setProp("--glass-opacity", `${t.glassOpacity || 0.25}`);
            setProp("--glass-saturation", `${t.glassSaturation || 150}%`);
            setProp("font-size", `${(t.scale || 1) * 100}%`);

            setProp("--theme-sidebar-bg", t.sidebarBg || "#ffffff");
            setProp("--theme-sidebar-fg", t.sidebarFg || "#1f2937");
            setProp("--theme-sidebar-border", t.sidebarBorder || "#e5e7eb");
            setProp("--theme-sidebar-accent", t.sidebarAccent || t.accent || "#14b8a6");
            setProp("--theme-sidebar-active", t.sidebarActive || "#f0fdfa");

            const gradient = calculateGradient(t.accentGradientStart, t.accentGradientEnd, t.accent);
            setProp("--theme-accent-prev", gradient.prev);
            setProp("--theme-accent-next", gradient.next);

            // ── Typography ────────────────────────────────────────────────────────
            const heading = t.fontHeading || "Inter";
            const body = t.fontBody || "Inter";
            const mono = t.fontMono || "JetBrains Mono";

            // Load each unique Google Font
            [heading, body, mono]
                .filter((f, i, arr) => arr.indexOf(f) === i)
                .forEach(loadGoogleFont);

            // Set CSS variables consumed by globals.css body / headings
            setProp("--font-heading-family", `'${heading}', ui-sans-serif, sans-serif`);
            setProp("--font-body-family", `'${body}', ui-sans-serif, sans-serif`);
            setProp("--font-mono-family", `'${mono}', ui-monospace, monospace`);
        };

        updateThemeVariables(theme);

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "THEME_PREVIEW_UPDATE" && event.data?.theme) {
                updateThemeVariables(event.data.theme as ThemeConfig);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [theme]);

    return null;
}
