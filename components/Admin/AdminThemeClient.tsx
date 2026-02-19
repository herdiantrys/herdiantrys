"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RefreshCcw, Palette, Sun, Moon, Info } from "lucide-react";
import { updateGlobalTheme } from "@/lib/actions/settings.actions";
import { ThemeConfig, DEFAULT_THEME } from "@/lib/types/theme";

import { useRouter } from "next/navigation";
import FrontPagePreview from "./FrontPagePreview";

export default function AdminThemeClient({ initialTheme }: { initialTheme: ThemeConfig }) {
    const router = useRouter();
    const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
    const [isSaving, setIsSaving] = useState(false);

    // OPTIMISTIC UPDATE: Broadcast changes to ThemeInjector immediately
    useEffect(() => {
        window.postMessage({ type: "THEME_PREVIEW_UPDATE", theme }, "*");
    }, [theme]);

    const handleChange = (key: keyof ThemeConfig, value: string | number) => {
        setTheme(prev => ({ ...prev, [key]: value }));
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

                {/* Left Column: Controls (Light/Dark/Interface) */}
                <div className="xl:col-span-7 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Light Mode Config */}
                        <ThemePanel
                            title="Light Mode"
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
                                // For light mode, we might receive 'gradientStart' -> map to 'accentGradientStart'
                                if (k === 'gradientStart') handleChange('accentGradientStart', v);
                                else if (k === 'gradientEnd') handleChange('accentGradientEnd', v);
                                else handleChange(k as any, v);
                            }}
                        />

                        {/* Dark Mode Config */}
                        <ThemePanel
                            title="Dark Mode"
                            icon={<Moon className="text-purple-400" />}
                            colors={{
                                primary: theme.darkPrimary,
                                secondary: theme.darkSecondary,
                                accent: theme.darkAccent,
                                button: theme.darkButton,
                                buttonText: theme.darkButtonText,
                                link: theme.darkLink,
                                card: theme.card,
                                cardText: theme.cardText,
                                radius: theme.radius,
                                sidebarBg: theme.sidebarBg,
                                sidebarFg: theme.sidebarFg,
                                sidebarBorder: theme.sidebarBorder,
                                sidebarAccent: theme.sidebarAccent,
                                sidebarActive: theme.sidebarActive,
                                gradientStart: theme.darkAccentGradientStart,
                                gradientEnd: theme.darkAccentGradientEnd
                            }}
                            onColorChange={(k, v) => {
                                if (k === 'radius') {
                                    handleChange('radius', v); // Shared setting
                                } else {
                                    // Handle gradients specifically for dark mode keys if we choose to map them
                                    // For now, let's just map them directly if the key is explicitly 'darkAccentGradientStart' 
                                    // passed from the panel, or use the prefix logic.

                                    // The Panel will pass 'gradientStart' -> we want 'darkAccentGradientStart'
                                    if (k === 'gradientStart') handleChange('darkAccentGradientStart', v);
                                    else if (k === 'gradientEnd') handleChange('darkAccentGradientEnd', v);
                                    else {
                                        const darkKey = `dark${k.charAt(0).toUpperCase() + k.slice(1)}`;
                                        handleChange(darkKey as any, v);
                                    }
                                }
                            }}
                        />
                    </div>

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
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="xl:col-span-5 h-[800px] sticky top-8">
                    <FrontPagePreview theme={theme} />
                </div>
            </div>

            {/* 60/30/10 Rule visualization */}
            <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-2 mb-6">
                    <Info className="text-teal-500" />
                    <h2 className="text-xl font-bold">Theme Distribution (60/30/10)</h2>
                </div>
                <div className="flex h-16 w-full rounded-2xl overflow-hidden shadow-inner border border-white/10">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DistributionCard
                        label="Primary (60%)"
                        usage="Used for major backgrounds, large surfaces, and the overall base tone of the site."
                    />
                    <DistributionCard
                        label="Secondary (30%)"
                        usage="Used for sidebars, navigation bars, cards, and distinct feature areas."
                    />
                    <DistributionCard
                        label="Accent (10%)"
                        usage="Used for call-to-action buttons, active states, highlights, and small visual cues."
                    />
                </div>
            </div>
        </div>
    );
}

function ThemePanel({ title, icon, colors, onColorChange }: {
    title: string,
    icon: React.ReactNode,
    colors: {
        primary: string, secondary: string, accent: string,
        button: string, buttonText: string, link: string,
        card: string, cardText: string,
        radius?: any, // Optional/shared
        sidebarBg?: string, sidebarFg?: string, sidebarBorder?: string, sidebarAccent?: string, sidebarActive?: string,
        gradientStart?: string, gradientEnd?: string
    },
    onColorChange: (k: string, v: string | number) => void
}) {
    return (
        <div className="bg-white/5 dark:bg-black/20 backdrop-blur-xl p-6 rounded-3xl space-y-6 border border-white/10">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                {icon}
                <h2 className="text-xl font-bold">{title} Config</h2>
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
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                    <h3 className="text-xs font-bold uppercase text-[var(--glass-text-muted)] tracking-wider">Accent Gradient</h3>
                    <ColorPicker
                        label="Gradient Start"
                        value={colors.gradientStart || colors.accent} // Fallback to accent if undefined
                        onChange={(v) => onColorChange('gradientStart', v)}
                        description="Start color of the accent gradient"
                    />
                    <ColorPicker
                        label="Gradient End"
                        value={colors.gradientEnd || colors.accent}
                        onChange={(v) => onColorChange('gradientEnd', v)}
                        description="End color of the accent gradient"
                    />
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                    <h3 className="text-xs font-bold uppercase text-[var(--glass-text-muted)] tracking-wider">Elements</h3>
                    <ColorPicker
                        label="Button Background"
                        value={colors.button}
                        onChange={(v) => onColorChange('button', v)}
                        description="Primary button background"
                    />
                    <ColorPicker
                        label="Button Text"
                        value={colors.buttonText}
                        onChange={(v) => onColorChange('buttonText', v)}
                        description="Text color inside buttons"
                    />
                    <ColorPicker
                        label="Link Color"
                        value={colors.link}
                        onChange={(v) => onColorChange('link', v)}
                        description="Hyperlink text color"
                    />
                    <ColorPicker
                        label="Card Background"
                        value={colors.card}
                        onChange={(v) => onColorChange('card', v)}
                        description="Background for cards/containers"
                    />
                    <ColorPicker
                        label="Card Text"
                        value={colors.cardText}
                        onChange={(v) => onColorChange('cardText', v)}
                        description="Text color inside cards"
                    />
                </div>
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
