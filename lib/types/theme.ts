export type ThemeConfig = {
    primary: string;
    secondary: string;
    accent: string;
    // Granular Controls
    button: string;
    buttonText: string;
    link: string;
    card: string;
    cardText: string;

    // Advanced Controls
    radius: number; // 0 to 2
    scale: number; // 0.8 to 1.2

    // Glassmorphism
    glassBlur: number; // px
    glassOpacity: number; // 0 to 1
    glassSaturation: number; // %

    // Sidebar Specific
    sidebarBg: string;
    sidebarFg: string;
    sidebarBorder: string;
    sidebarAccent: string;
    sidebarActive: string;

    darkPrimary: string;
    darkSecondary: string;
    darkAccent: string;
    // Granular Controls Dark
    darkButton: string;
    darkButtonText: string;
    darkLink: string;
    darkCard: string;
    darkCardText: string;

    // Sidebar Specific Dark
    darkSidebarBg: string;
    darkSidebarFg: string;
    darkSidebarBorder: string;
    darkSidebarAccent: string;
    darkSidebarAccent: string;
    darkSidebarActive: string;

    // Gradient Overrides
    accentGradientStart?: string;
    accentGradientEnd?: string;
    darkAccentGradientStart?: string;
    darkAccentGradientEnd?: string;
};

export const DEFAULT_THEME: ThemeConfig = {
    primary: "#f5f7f8",
    secondary: "#ffffff",
    accent: "#14b8a6",
    button: "#14b8a6",
    buttonText: "#ffffff",
    link: "#14b8a6",
    card: "#ffffff",
    cardText: "#1f2937",

    radius: 0.5,
    scale: 1,
    glassBlur: 8,
    glassOpacity: 0.25,
    glassSaturation: 150,

    sidebarBg: "#ffffff",
    sidebarFg: "#1f2937",
    sidebarBorder: "#e5e7eb",
    sidebarAccent: "#14b8a6",
    sidebarActive: "#f0fdfa",

    darkPrimary: "#252525",
    darkSecondary: "#333333",
    darkAccent: "#2dd4bf",
    darkButton: "#2dd4bf",
    darkButtonText: "#1a1a1a",
    darkLink: "#2dd4bf",
    darkCard: "#333333",
    darkCardText: "#ffffff",

    darkSidebarBg: "#333333",
    darkSidebarFg: "#ffffff",
    darkSidebarBorder: "#404040",
    darkSidebarAccent: "#2dd4bf",
    darkSidebarActive: "#2d2d2d",
};
