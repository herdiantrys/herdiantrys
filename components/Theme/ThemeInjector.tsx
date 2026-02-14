"use client";

import { useEffect } from "react";
import { ThemeConfig } from "@/lib/types/theme";

export default function ThemeInjector({ theme }: { theme: ThemeConfig }) {
    useEffect(() => {
        if (!theme) return;

        const root = document.documentElement;

        // Helper to update property if value exists
        const setProp = (name: string, value: string | undefined | number) => {
            if (value !== undefined) {
                root.style.setProperty(name, String(value));
            }
        };

        // Helper to convert Hex to HSL
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
            r /= 255;
            g /= 255;
            b /= 255;
            const cmin = Math.min(r, g, b),
                cmax = Math.max(r, g, b),
                delta = cmax - cmin;
            let h = 0, s = 0, l = 0;

            if (delta === 0) h = 0;
            else if (cmax === r) h = ((g - b) / delta) % 6;
            else if (cmax === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;

            h = Math.round(h * 60);
            if (h < 0) h += 360;

            l = (cmax + cmin) / 2;
            s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
            s = +(s * 100).toFixed(1);
            l = +(l * 100).toFixed(1);

            return { h, s, l };
        };

        // Helper to calculate gradient colors
        const calculateGradient = (start: string | undefined, end: string | undefined, baseAccent: string) => {
            if (start && end) {
                return { prev: start, next: end };
            }
            // Fallback generation
            if (!baseAccent) return { prev: "#14b8a6", next: "#06b6d4" }; // default teal-500/cyan-500

            const accentHsl = hexToHsl(baseAccent);
            const prevH = (accentHsl.h - 5 + 360) % 360;
            const nextH = (accentHsl.h + 5) % 360;

            return {
                prev: `hsl(${prevH}, ${accentHsl.s}%, ${accentHsl.l}%)`,
                next: `hsl(${nextH}, ${accentHsl.s}%, ${accentHsl.l}%)`
            };
        };

        const updateThemeVariables = (currentTheme: ThemeConfig) => {
            // Light Mode Source Variables
            setProp("--theme-light-primary", currentTheme.primary);
            setProp("--theme-light-secondary", currentTheme.secondary);
            setProp("--theme-light-accent", currentTheme.accent);
            setProp("--theme-light-button", currentTheme.button || currentTheme.accent);
            setProp("--theme-light-button-text", currentTheme.buttonText || "#ffffff");
            setProp("--theme-light-link", currentTheme.link || currentTheme.accent);
            setProp("--theme-light-card", currentTheme.card || "#ffffff");
            setProp("--theme-light-card-text", currentTheme.cardText || "#1f2937");

            // Advanced & Sidebar (Light)
            setProp("--radius", `${currentTheme.radius || 0.5}rem`);
            setProp("--glass-blur", `${currentTheme.glassBlur || 8}px`);
            setProp("--glass-opacity", `${currentTheme.glassOpacity || 0.25}`);
            setProp("--glass-saturation", `${currentTheme.glassSaturation || 150}%`);

            // Scale (Density)
            setProp("font-size", `${(currentTheme.scale || 1) * 100}%`);

            setProp("--theme-light-sidebar-bg", currentTheme.sidebarBg || "#ffffff");
            setProp("--theme-light-sidebar-fg", currentTheme.sidebarFg || "#1f2937");
            setProp("--theme-light-sidebar-border", currentTheme.sidebarBorder || "#e5e7eb");
            setProp("--theme-light-sidebar-accent", currentTheme.sidebarAccent || currentTheme.accent || "#14b8a6");
            setProp("--theme-light-sidebar-active", currentTheme.sidebarActive || "#f0fdfa");

            // Dark Mode Source Variables
            setProp("--theme-dark-primary", currentTheme.darkPrimary);
            setProp("--theme-dark-secondary", currentTheme.darkSecondary);
            setProp("--theme-dark-accent", currentTheme.darkAccent);
            setProp("--theme-dark-button", currentTheme.darkButton || currentTheme.darkAccent);
            setProp("--theme-dark-button-text", currentTheme.darkButtonText || "#1a1a1a");
            setProp("--theme-dark-link", currentTheme.darkLink || currentTheme.darkAccent);
            setProp("--theme-dark-card", currentTheme.darkCard || "#333333");
            setProp("--theme-dark-card-text", currentTheme.darkCardText || "#ffffff");

            // Sidebar (Dark)
            setProp("--theme-dark-sidebar-bg", currentTheme.darkSidebarBg || "#333333");
            setProp("--theme-dark-sidebar-fg", currentTheme.darkSidebarFg || "#ffffff");
            setProp("--theme-dark-sidebar-border", currentTheme.darkSidebarBorder || "#404040");
            setProp("--theme-dark-sidebar-accent", currentTheme.darkSidebarAccent || currentTheme.darkAccent || "#2dd4bf");
            setProp("--theme-dark-sidebar-active", currentTheme.darkSidebarActive || "#2d2d2d");

            // --- STRICT GRADIENT SEPARATION ---

            // 1. Light Mode Gradient
            const lightGradient = calculateGradient(
                currentTheme.accentGradientStart,
                currentTheme.accentGradientEnd,
                currentTheme.accent
            );
            setProp("--theme-light-accent-prev", lightGradient.prev);
            setProp("--theme-light-accent-next", lightGradient.next);

            // 2. Dark Mode Gradient
            // Note: We currently don't have separate fields for darkAccentGradientStart/End in ThemeConfig interface yet (likely),
            // but if we did, we would use them here. For now, we fallback to generating from darkAccent.
            // If the user adds 'darkAccentGradientStart' later, we can use it here.
            // Assuming the type definition might not have them yet, we check safely or just generate.
            // Let's assume for now we generate from darkAccent to ensure separation.

            // Checking if the properties exist on the object (even if TS ignores them for now)
            const darkStart = (currentTheme as any).darkAccentGradientStart;
            const darkEnd = (currentTheme as any).darkAccentGradientEnd;

            const darkGradient = calculateGradient(
                darkStart,
                darkEnd,
                currentTheme.darkAccent
            );
            setProp("--theme-dark-accent-prev", darkGradient.prev);
            setProp("--theme-dark-accent-next", darkGradient.next);
        };

        // Initial Load
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
