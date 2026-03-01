"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RefreshCcw, Palette, Sun, Moon, Info, Type } from "lucide-react";
import { updateGlobalTheme } from "@/lib/actions/settings.actions";
import { ThemeConfig, DEFAULT_THEME } from "@/lib/types/theme";

import { useRouter } from "next/navigation";
import FrontPagePreview from "./FrontPagePreview";

export default function AdminThemeClient({ initialTheme }: { initialTheme: ThemeConfig }) {
    const router = useRouter();
    const [theme, setTheme] = useState<ThemeConfig>(() => ({
        ...initialTheme,
        darkSecondary: initialTheme.secondary,
        darkAccent: initialTheme.accent,
        darkButton: initialTheme.button,
        darkButtonText: initialTheme.buttonText,
        darkLink: initialTheme.link,
        darkCard: initialTheme.card,
        darkCardText: initialTheme.cardText,
        darkSidebarBg: initialTheme.sidebarBg,
        darkSidebarFg: initialTheme.sidebarFg,
        darkSidebarBorder: initialTheme.sidebarBorder,
        darkSidebarAccent: initialTheme.sidebarAccent,
        darkSidebarActive: initialTheme.sidebarActive,
        darkAccentGradientStart: initialTheme.accentGradientStart,
        darkAccentGradientEnd: initialTheme.accentGradientEnd,
    }));
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewDark, setIsPreviewDark] = useState(true);

    // OPTIMISTIC UPDATE: Broadcast changes to ThemeInjector immediately
    useEffect(() => {
        window.postMessage({ type: "THEME_PREVIEW_UPDATE", theme }, "*");
    }, [theme]);

    const handleChange = (key: keyof ThemeConfig, value: string | number) => {
        setTheme(prev => {
            const next = { ...prev, [key]: value };

            if (key === 'secondary') next.darkSecondary = value as string;
            if (key === 'accent') next.darkAccent = value as string;
            if (key === 'button') next.darkButton = value as string;
            if (key === 'buttonText') next.darkButtonText = value as string;
            if (key === 'link') next.darkLink = value as string;
            if (key === 'card') next.darkCard = value as string;
            if (key === 'cardText') next.darkCardText = value as string;
            if (key === 'sidebarBg') next.darkSidebarBg = value as string;
            if (key === 'sidebarFg') next.darkSidebarFg = value as string;
            if (key === 'sidebarBorder') next.darkSidebarBorder = value as string;
            if (key === 'sidebarAccent') next.darkSidebarAccent = value as string;
            if (key === 'sidebarActive') next.darkSidebarActive = value as string;
            if (key === 'accentGradientStart') next.darkAccentGradientStart = value as string;
            if (key === 'accentGradientEnd') next.darkAccentGradientEnd = value as string;

            return next;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateGlobalTheme(theme);
            if (res.success) {
                toast.success("Theme updated successfully!");
                router.refresh(); // Force re-fetch of server components (RootLayout)
            } else {
                toast.error(res.error || "Failed to update theme");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to restore default colors?")) {
            setTheme(DEFAULT_THEME);
        }
    };

    const [activeTab, setActiveTab] = useState<"light" | "dark" | "interface" | "typography">("light");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--glass-text)] flex items-center gap-3">
                        <Palette className="text-teal-500" />
                        Global Theme Settings
                    </h1>
                    <p className="text-[var(--glass-text-muted)] mt-1">
                        Control the entire website's color palette using the 60/30/10 design rule.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--glass-text)] hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <RefreshCcw size={18} />
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-xl bg-[var(--site-button)] text-[var(--site-button-text)] font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--site-button)]/25 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Main Configuration Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Left Column: Controls (Tabs) */}
                <div className="xl:col-span-7 flex flex-col gap-6">

                    {/* Tab Navigation */}
                    <div className="flex bg-white/5 dark:bg-black/20 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md w-full max-w-lg">
                        <TabButton
                            active={activeTab === "light"}
                            onClick={() => setActiveTab("light")}
                            icon={<Sun size={16} className={activeTab === "light" ? "text-orange-400" : ""} />}
                            label="Light Theme"
                        />
                        <TabButton
                            active={activeTab === "dark"}
                            onClick={() => setActiveTab("dark")}
                            icon={<Moon size={16} className={activeTab === "dark" ? "text-purple-400" : ""} />}
                            label="Dark Theme"
                        />
                        <TabButton
                            active={activeTab === "interface"}
                            onClick={() => setActiveTab("interface")}
                            icon={<Palette size={16} className={activeTab === "interface" ? "text-pink-400" : ""} />}
                            label="Interface"
                        />
                        <TabButton
                            active={activeTab === "typography"}
                            onClick={() => setActiveTab("typography")}
                            icon={<Type size={16} className={activeTab === "typography" ? "text-blue-400" : ""} />}
                            label="Typografi"
                        />
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 relative">
                        {activeTab === "light" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* 60/30/10 Rule visualization */}
                                <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="text-teal-500" size={18} />
                                        <h3 className="text-lg font-bold">Theme Distribution (60/30/10)</h3>
                                    </div>
                                    <div className="flex h-12 w-full rounded-xl overflow-hidden shadow-inner border border-white/10 mb-6">
                                        <div
                                            className="h-full flex items-center justify-center text-xs font-bold text-white/70"
                                            style={{ backgroundColor: theme.primary, width: '60%' }}
                                        >
                                            60% Primary
                                        </div>
                                        <div
                                            className="h-full flex items-center justify-center text-xs font-bold text-black/50"
                                            style={{ backgroundColor: theme.secondary, width: '30%' }}
                                        >
                                            30% Secondary
                                        </div>
                                        <div
                                            className="h-full flex items-center justify-center text-xs font-bold text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"
                                            style={{ backgroundColor: theme.accent, width: '10%' }}
                                        >
                                            10% Accent
                                        </div>
                                    </div>
                                </div>

                                {/* Light Mode Config */}
                                <ThemePanel
                                    title="Global Theme (Light Primary)"
                                    icon={<Sun className="text-orange-400" />}
                                    colors={{
                                        primary: theme.primary,
                                        secondary: theme.secondary,
                                        accent: theme.accent,
                                        button: theme.button,
                                        buttonText: theme.buttonText,
                                        link: theme.link,
                                        card: theme.card,
                                        cardText: theme.cardText,
                                        gradientStart: theme.accentGradientStart,
                                        gradientEnd: theme.accentGradientEnd
                                    }}
                                    onColorChange={(k, v) => {
                                        if (k === 'gradientStart') handleChange('accentGradientStart', v);
                                        else if (k === 'gradientEnd') handleChange('accentGradientEnd', v);
                                        else handleChange(k as any, v);
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === "dark" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Dark Mode Config */}
                                <ThemePanel
                                    title="Dark Mode Primary"
                                    icon={<Moon className="text-purple-400" />}
                                    isDarkMode={true}
                                    colors={{
                                        primary: theme.darkPrimary,
                                    }}
                                    onColorChange={(k, v) => {
                                        if (k === 'primary') handleChange('darkPrimary', v);
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === "interface" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Interface Settings */}
                                <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                        <Palette className="text-pink-500" />
                                        <h2 className="text-xl font-bold">Interface & Glassmorphism</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold uppercase text-[var(--glass-text-muted)] tracking-wider">Glass Effect</h3>
                                            <RangePicker
                                                label="Blur Strength"
                                                value={theme.glassBlur ?? 8}
                                                min={0} max={20} step={1}
                                                suffix="px"
                                                onChange={(v) => handleChange('glassBlur', v)}
                                                description="Softness of the background blur."
                                            />
                                            <RangePicker
                                                label="Opacity"
                                                value={theme.glassOpacity ?? 0.25}
                                                min={0} max={1} step={0.05}
                                                onChange={(v) => handleChange('glassOpacity', v)}
                                                description="Transparency of the glass layer."
                                            />
                                            <RangePicker
                                                label="Saturation"
                                                value={theme.glassSaturation ?? 150}
                                                min={100} max={200} step={10}
                                                suffix="%"
                                                onChange={(v) => handleChange('glassSaturation', v)}
                                                description="Vibrancy of colors behind the glass."
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold uppercase text-[var(--glass-text-muted)] tracking-wider">Layout & Density</h3>
                                            <RangePicker
                                                label="Global Scale (Density)"
                                                value={theme.scale ?? 1}
                                                min={0.8} max={1.2} step={0.05}
                                                onChange={(v) => handleChange('scale', v)}
                                                description="Adjust the comprehensive size of the UI."
                                            />
                                            <RangePicker
                                                label="Global Radius"
                                                value={theme.radius ?? 0.5}
                                                min={0} max={1.5} step={0.125}
                                                suffix="rem"
                                                onChange={(v) => handleChange('radius', v)}
                                                description="Roundness of buttons, cards, and inputs."
                                            />
                                        </div>
                                    </div>

                                    {/* Interactive Live Glass Preview */}
                                    <div className={`pt-8 mt-4 border-t border-white/10 relative overflow-hidden rounded-2xl w-full h-[300px] flex items-center justify-center p-8 group transition-colors duration-500 ${isPreviewDark ? 'bg-gray-900/60' : 'bg-gray-100'}`}>

                                        {/* Theme Toggle for Preview */}
                                        <button
                                            onClick={() => setIsPreviewDark(!isPreviewDark)}
                                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                                            title="Toggle Preview Background"
                                        >
                                            {isPreviewDark ? <Sun size={16} className="text-orange-400" /> : <Moon size={16} className="text-purple-500" />}
                                        </button>

                                        {/* Decorative background blobs to show off glass effect clearly */}
                                        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-[var(--site-accent)] rounded-full mix-blend-screen filter blur-2xl opacity-60 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700"></div>
                                        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-[var(--site-secondary)] rounded-full mix-blend-screen filter blur-3xl opacity-50 group-hover:-translate-x-8 group-hover:translate-y-4 transition-transform duration-700"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-[var(--site-accent)] to-purple-500 rounded-full mix-blend-screen filter blur-[40px] opacity-40 animate-pulse"></div>

                                        {/* The Glass Component Preview */}
                                        <div
                                            style={{
                                                backdropFilter: `blur(${theme.glassBlur}px) saturate(${theme.glassSaturation}%)`,
                                                WebkitBackdropFilter: `blur(${theme.glassBlur}px) saturate(${theme.glassSaturation}%)`,
                                                backgroundColor: `rgba(${isPreviewDark ? '255, 255, 255' : '0, 0, 0'}, ${theme.glassOpacity})`,
                                                borderRadius: `${theme.radius}rem`,
                                                transform: `scale(${theme.scale})`,
                                            }}
                                            className={`relative z-10 w-full max-w-xs border border-white/20 p-6 shadow-2xl transition-all duration-300 flex flex-col items-center text-center ${isPreviewDark ? 'border-white/10' : 'border-black/10'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center shadow-inner ${isPreviewDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                                <Palette className={isPreviewDark ? 'text-white drop-shadow-md' : 'text-gray-900 drop-shadow-md'} size={20} />
                                            </div>
                                            <h4 className={`text-lg font-bold mb-2 tracking-tight drop-shadow-sm ${isPreviewDark ? 'text-white' : 'text-gray-900'}`}>Glass Preview</h4>
                                            <p className={`text-xs font-medium leading-relaxed max-w-[200px] drop-shadow-sm ${isPreviewDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Observe how blur, opacity, and saturation interact with the vibrant background behind this card.
                                            </p>
                                            <button
                                                style={{ borderRadius: `${theme.radius}rem` }}
                                                className={`mt-6 px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-colors shadow-sm ${isPreviewDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-gray-900 hover:bg-black/20'}`}
                                            >
                                                Interactive
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "typography" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                        <Type className="text-blue-400" />
                                        <div>
                                            <h2 className="text-xl font-bold">Typografi</h2>
                                            <p className="text-[11px] text-[var(--glass-text-muted)] mt-0.5">Font dimuat dari Google Fonts dan berlaku di seluruh website secara instan.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <FontPicker
                                            label="Heading Font"
                                            value={theme.fontHeading ?? "Inter"}
                                            onChange={(v) => handleChange('fontHeading', v)}
                                            description="Digunakan untuk h1–h6 di seluruh website"
                                        />
                                        <FontPicker
                                            label="Body Font"
                                            value={theme.fontBody ?? "Inter"}
                                            onChange={(v) => handleChange('fontBody', v)}
                                            description="Digunakan untuk paragraf dan teks umum"
                                        />
                                        <FontPicker
                                            label="Monospace Font"
                                            value={theme.fontMono ?? "JetBrains Mono"}
                                            onChange={(v) => handleChange('fontMono', v)}
                                            description="Digunakan untuk code, pre, dan elemen keyboard"
                                            isMono
                                        />
                                    </div>

                                    {/* Live Font Preview */}
                                    <div className="mt-2 p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--glass-text-muted)] mb-4">Live Preview</p>
                                        <h3
                                            className="text-3xl font-bold text-[var(--glass-text)] leading-tight"
                                            style={{ fontFamily: `'${theme.fontHeading ?? "Inter"}', sans-serif` }}
                                        >
                                            The quick brown fox
                                        </h3>
                                        <p
                                            className="text-sm text-[var(--glass-text-muted)] leading-relaxed"
                                            style={{ fontFamily: `'${theme.fontBody ?? "Inter"}', sans-serif` }}
                                        >
                                            Jumps over the lazy dog. 1234567890
                                        </p>
                                        <code
                                            className="text-xs text-[var(--glass-text-muted)] mt-2 block"
                                            style={{ fontFamily: `'${theme.fontMono ?? "JetBrains Mono"}', monospace` }}
                                        >
                                            {`const greet = () => "Hello, World!";`}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="xl:col-span-5 h-[800px] sticky top-8">
                    <FrontPagePreview theme={theme} />
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all
                ${active
                    ? "bg-white dark:bg-white/10 text-black dark:text-white shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }
            `}
        >
            {icon}
            {label}
        </button>
    );
}

function ThemePanel({ title, icon, colors, onColorChange, isDarkMode = false }: {
    title: string,
    icon: React.ReactNode,
    colors: {
        primary: string, secondary?: string, accent?: string,
        button?: string, buttonText?: string, link?: string,
        card?: string, cardText?: string,
        radius?: any, // Optional/shared
        sidebarBg?: string, sidebarFg?: string, sidebarBorder?: string, sidebarAccent?: string, sidebarActive?: string,
        gradientStart?: string, gradientEnd?: string
    },
    onColorChange: (k: string, v: string | number) => void,
    isDarkMode?: boolean
}) {
    return (
        <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl p-6 rounded-3xl space-y-6 border border-white/10">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                {icon}
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold">{title} Config</h2>
                    {isDarkMode && <span className="text-[10px] text-[var(--glass-text-muted)]">Only Primary color differs from Light Mode</span>}
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-[var(--glass-text-muted)] tracking-wider">Base Colors</h3>
                    <ColorPicker
                        label="Primary (60%)"
                        value={colors.primary}
                        onChange={(v) => onColorChange('primary', v)}
                        description="Background and main content area"
                    />
                    {!isDarkMode && colors.secondary && colors.accent && (
                        <>
                            <ColorPicker
                                label="Secondary (30%)"
                                value={colors.secondary}
                                onChange={(v) => onColorChange('secondary', v)}
                                description="Navigation and UI surfaces"
                            />
                            <ColorPicker
                                label="Accent (10%)"
                                value={colors.accent}
                                onChange={(v) => onColorChange('accent', v)}
                                description="Interactive elements and highlights"
                            />
                        </>
                    )}
                </div>

                {!isDarkMode && (
                    <>
                        <div className="pt-4 border-t border-white/5 space-y-2">
                            <h3 className="text-xs font-bold uppercase text-[var(--glass-text-muted)] tracking-wider">Accent Gradient</h3>
                            <ColorPicker
                                label="Gradient Start"
                                value={colors.gradientStart || colors.accent || ""}
                                onChange={(v) => onColorChange('gradientStart', v)}
                                description="Start color of the accent gradient"
                            />
                            <ColorPicker
                                label="Gradient End"
                                value={colors.gradientEnd || colors.accent || ""}
                                onChange={(v) => onColorChange('gradientEnd', v)}
                                description="End color of the accent gradient"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-2">
                            <h3 className="text-xs font-bold uppercase text-[var(--glass-text-muted)] tracking-wider">Elements</h3>
                            <ColorPicker
                                label="Button Background"
                                value={colors.button || ""}
                                onChange={(v) => onColorChange('button', v)}
                                description="Primary button background"
                            />
                            <ColorPicker
                                label="Button Text"
                                value={colors.buttonText || ""}
                                onChange={(v) => onColorChange('buttonText', v)}
                                description="Text color inside buttons"
                            />
                            <ColorPicker
                                label="Link Color"
                                value={colors.link || ""}
                                onChange={(v) => onColorChange('link', v)}
                                description="Hyperlink text color"
                            />
                            <ColorPicker
                                label="Card Background"
                                value={colors.card || ""}
                                onChange={(v) => onColorChange('card', v)}
                                description="Background for cards/containers"
                            />
                            <ColorPicker
                                label="Card Text"
                                value={colors.cardText || ""}
                                onChange={(v) => onColorChange('cardText', v)}
                                description="Text color inside cards"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ColorPicker({ label, value, onChange, description }: { label: string, value: string, onChange: (v: string) => void, description: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10 group">
            <div className="flex flex-col">
                <span className="text-sm font-bold">{label}</span>
                <span className="text-[10px] text-[var(--glass-text-muted)]">{description}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text)] transition-colors">
                    {value}
                </span>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none appearance-none overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-xl"
                />
            </div>
        </div>
    );
}

function DistributionCard({ label, usage }: { label: string, usage: string }) {
    return (
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 space-y-2">
            <h3 className="font-bold text-sm text-teal-500">{label}</h3>
            <p className="text-[11px] text-[var(--glass-text-muted)] leading-relaxed">
                {usage}
            </p>
        </div>
    );
}

function RangePicker({ label, value, min, max, step, onChange, suffix = "", description }: {
    label: string, value: number, min: number, max: number, step: number,
    onChange: (v: number) => void, suffix?: string, description: string
}) {
    return (
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10 group">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold">{label}</span>
                <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-[var(--glass-text)]">
                    {typeof value === 'number' ? value.toFixed(2).replace(/\.00$/, '') : value}{suffix}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <span className="text-[10px] text-[var(--glass-text-muted)]">{description}</span>
        </div>
    );
}

// ── Curated font list ─────────────────────────────────────────────────────────
const SANS_FONTS = [
    "Inter", "Plus Jakarta Sans", "Outfit", "DM Sans", "Space Grotesk",
    "Geist", "Poppins", "Nunito", "Raleway", "Figtree",
    "Sora", "Manrope", "Be Vietnam Pro", "Urbanist", "Lexend",
];
const SERIF_FONTS = [
    "Playfair Display", "Merriweather", "Lora", "DM Serif Display",
    "Cormorant Garamond", "Libre Baskerville", "Crimson Pro",
];
const MONO_FONTS = [
    "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono",
    "Cascadia Code", "Space Mono", "Roboto Mono",
];
const ALL_FONTS = [...SANS_FONTS, ...SERIF_FONTS, ...MONO_FONTS];

function FontPicker({
    label, value, onChange, description, isMono = false
}: {
    label: string; value: string; onChange: (v: string) => void;
    description: string; isMono?: boolean;
}) {
    const fontList = isMono ? MONO_FONTS : [...SANS_FONTS, ...SERIF_FONTS];

    // Pre-load preview fonts on mount
    if (typeof window !== "undefined") {
        fontList.forEach(family => {
            const id = `gfont-admin-${family.replace(/\s+/g, "-").toLowerCase()}`;
            if (!document.getElementById(id)) {
                const link = document.createElement("link");
                link.id = id;
                link.rel = "stylesheet";
                link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s/g, "+")}:wght@400;700&display=swap`;
                document.head.appendChild(link);
            }
        });
    }

    return (
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-sm font-bold block">{label}</span>
                    <span className="text-[10px] text-[var(--glass-text-muted)]">{description}</span>
                </div>
                <span
                    className="text-sm font-semibold text-[var(--glass-text-muted)] shrink-0 ml-4"
                    style={{ fontFamily: `'${value}', sans-serif` }}
                >
                    {value}
                </span>
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/10 dark:bg-black/30 border border-white/10 text-[var(--glass-text)] focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer"
                style={{ fontFamily: `'${value}', sans-serif` }}
            >
                {!isMono && (
                    <optgroup label="Sans-Serif">
                        {SANS_FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
                        ))}
                    </optgroup>
                )}
                {!isMono && (
                    <optgroup label="Serif">
                        {SERIF_FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: `'${f}', serif` }}>{f}</option>
                        ))}
                    </optgroup>
                )}
                {isMono && (
                    <optgroup label="Monospace">
                        {MONO_FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: `'${f}', monospace` }}>{f}</option>
                        ))}
                    </optgroup>
                )}
            </select>
        </div>
    );
}

