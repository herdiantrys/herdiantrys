export type ThemeConfig = {
    useColorRule603010?: boolean;
    primary: string;
    secondary: string;
    accent: string;
    // Granular Controls
    button: string;
    buttonGradientStart?: string;
    buttonGradientEnd?: string;
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

    // Typography
    fontHeading?: string; // Google Fonts family name for headings
    fontBody?: string; // Google Fonts family name for body text
    fontMono?: string; // Google Fonts family name for monospace

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
    darkButtonGradientStart?: string;
    darkButtonGradientEnd?: string;
    darkButtonText: string;
    darkLink: string;
    darkCard: string;
    darkCardText: string;

    // Sidebar Specific Dark
    darkSidebarBg: string;
    darkSidebarFg: string;
    darkSidebarBorder: string;
    darkSidebarAccent: string;
    darkSidebarActive: string;

    // Gradient Overrides
    accentGradientStart?: string;
    accentGradientEnd?: string;
    darkAccentGradientStart?: string;
    darkAccentGradientEnd?: string;
};

export const DEFAULT_THEME: ThemeConfig = {
    useColorRule603010: true,
    primary: "#eef4fb",
    secondary: "#a7ebff",
    accent: "#6d63ff",
    button: "#a7ebff",
    buttonGradientStart: "#d7f7ff",
    buttonGradientEnd: "#6d63ff",
    buttonText: "#081019",
    link: "#5a5bf0",
    card: "#f6f9fd",
    cardText: "#10213d",

    radius: 1.25,
    scale: 1,
    glassBlur: 20,
    glassOpacity: 0.26,
    glassSaturation: 180,

    // Default fonts for Ethereal Professional
    fontHeading: "Space Grotesk",
    fontBody: "Inter",
    fontMono: "JetBrains Mono",

    sidebarBg: "#f2f6fc",
    sidebarFg: "#10213d",
    sidebarBorder: "#d9e2ee",
    sidebarAccent: "#8fe5ff",
    sidebarActive: "#e8eff8",

    darkPrimary: "#070d1b",
    darkSecondary: "#c3f5ff",
    darkAccent: "#9e8cff",
    darkButton: "#9cefff",
    darkButtonGradientStart: "#c3f5ff",
    darkButtonGradientEnd: "#00e5ff",
    darkButtonText: "#081019",
    darkLink: "#8df3ff",
    darkCard: "#11192c",
    darkCardText: "#dae2fd",

    darkSidebarBg: "#091224",
    darkSidebarFg: "#dae2fd",
    darkSidebarBorder: "#2b3450",
    darkSidebarAccent: "#c3f5ff",
    darkSidebarActive: "#111a2f",

    accentGradientStart: "#00e5ff",
    accentGradientEnd: "#8f7dff",
    darkAccentGradientStart: "#00e5ff",
    darkAccentGradientEnd: "#9e8cff",
};
