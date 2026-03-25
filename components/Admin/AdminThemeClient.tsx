"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, RefreshCcw, Palette, Sun, Moon, Type, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import FrontPagePreview from "./FrontPagePreview";
import { updateGlobalTheme } from "@/lib/actions/settings.actions";
import { ThemeConfig, DEFAULT_THEME } from "@/lib/types/theme";
import { applyColorRule603010 } from "@/lib/theme-color-rule";

type ThemeTab = "light" | "dark" | "interface" | "typography";

const normalizeTheme = (theme: ThemeConfig) =>
    applyColorRule603010({
        ...DEFAULT_THEME,
        ...theme,
        useColorRule603010: theme.useColorRule603010 ?? true,
    });

export default function AdminThemeClient({ initialTheme }: { initialTheme: ThemeConfig }) {
    const router = useRouter();
    const [theme, setTheme] = useState<ThemeConfig>(() => normalizeTheme(initialTheme));
    const [activeTab, setActiveTab] = useState<ThemeTab>("light");
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewDark, setIsPreviewDark] = useState(true);

    useEffect(() => {
        window.postMessage({ type: "THEME_PREVIEW_UPDATE", theme }, "*");
    }, [theme]);

    const handleChange = (key: keyof ThemeConfig, value: string | number | boolean) => {
        setTheme((prev) => normalizeTheme({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const nextTheme = normalizeTheme(theme);
            const result = await updateGlobalTheme(nextTheme);
            if (result.success) {
                setTheme(nextTheme);
                toast.success("Theme 60/30/10 berhasil disimpan.");
                router.refresh();
            } else {
                toast.error(result.error || "Gagal menyimpan theme.");
            }
        } catch {
            toast.error("Terjadi error saat menyimpan theme.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (!window.confirm("Kembalikan seluruh theme ke default 60/30/10?")) return;
        setTheme(normalizeTheme(DEFAULT_THEME));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-[var(--glass-text)]">
                        <Palette className="text-[var(--site-secondary)]" />
                        Global Theme Settings
                    </h1>
                    <p className="mt-1 text-[var(--glass-text-muted)]">
                        Atur tiga warna inti per mode, sistem radius global, dan glass behavior. Button, card, link, sidebar, serta surface UI akan mengikuti rule 60:30:10 secara otomatis.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--ghost-border)] bg-white/5 px-4 py-2 text-[var(--glass-text)] transition-all hover:bg-white/10"
                    >
                        <RefreshCcw size={18} />
                        Reset Default
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--site-button)] px-6 py-2.5 font-bold text-[var(--site-button-text)] transition-all hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={18} />
                        {isSaving ? "Saving..." : "Save Theme"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                <div className="flex flex-col gap-6 xl:col-span-7">
                    <div className="flex w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
                        <TabButton active={activeTab === "light"} onClick={() => setActiveTab("light")} icon={<Sun size={16} />} label="Light Rule" />
                        <TabButton active={activeTab === "dark"} onClick={() => setActiveTab("dark")} icon={<Moon size={16} />} label="Dark Rule" />
                        <TabButton active={activeTab === "interface"} onClick={() => setActiveTab("interface")} icon={<Palette size={16} />} label="Interface" />
                        <TabButton active={activeTab === "typography"} onClick={() => setActiveTab("typography")} icon={<Type size={16} />} label="Typography" />
                    </div>

                    {activeTab === "light" && (
                        <div className="space-y-6">
                            <RuleCard
                                title="Light Mode 60:30:10"
                                description="Primary membentuk atmosfer, secondary membangun surface, dan accent mengendalikan interaksi. Token UI lainnya dibuat otomatis dari tiga warna ini."
                                primary={theme.primary}
                                secondary={theme.secondary}
                                accent={theme.accent}
                            />
                            <ColorSection
                                title="Light Base Colors"
                                icon={<Sun className="text-orange-400" />}
                                colors={[
                                    { key: "primary", label: "Primary 60%", value: theme.primary, description: "Fondasi background dan area terbesar UI." },
                                    { key: "secondary", label: "Secondary 30%", value: theme.secondary, description: "Surface pendukung, dock, dan visual support." },
                                    { key: "accent", label: "Accent 10%", value: theme.accent, description: "Highlight, CTA, dan state interaktif." },
                                ]}
                                generated={[
                                    { label: "Button Start", value: theme.buttonGradientStart || theme.button },
                                    { label: "Button End", value: theme.buttonGradientEnd || theme.accent },
                                    { label: "Button Text", value: theme.buttonText },
                                    { label: "Link", value: theme.link },
                                    { label: "Card", value: theme.card },
                                    { label: "Card Text", value: theme.cardText },
                                    { label: "Sidebar", value: theme.sidebarBg },
                                    { label: "Sidebar Active", value: theme.sidebarActive },
                                ]}
                                onColorChange={handleChange}
                            />
                        </div>
                    )}

                    {activeTab === "dark" && (
                        <div className="space-y-6">
                            <RuleCard
                                title="Dark Mode 60:30:10"
                                description="Dark mode memakai trio warna sendiri agar depth, glow, dan kontras tetap konsisten di seluruh surface gelap."
                                primary={theme.darkPrimary}
                                secondary={theme.darkSecondary}
                                accent={theme.darkAccent}
                            />
                            <ColorSection
                                title="Dark Base Colors"
                                icon={<Moon className="text-[var(--site-accent)]" />}
                                colors={[
                                    { key: "darkPrimary", label: "Primary 60%", value: theme.darkPrimary, description: "Base surface untuk dark mode." },
                                    { key: "darkSecondary", label: "Secondary 30%", value: theme.darkSecondary, description: "Support surface dan elevated panes." },
                                    { key: "darkAccent", label: "Accent 10%", value: theme.darkAccent, description: "Glow, highlight, dan CTA dark mode." },
                                ]}
                                generated={[
                                    { label: "Button Start", value: theme.darkButtonGradientStart || theme.darkButton },
                                    { label: "Button End", value: theme.darkButtonGradientEnd || theme.darkAccent },
                                    { label: "Button Text", value: theme.darkButtonText },
                                    { label: "Link", value: theme.darkLink },
                                    { label: "Card", value: theme.darkCard },
                                    { label: "Card Text", value: theme.darkCardText },
                                    { label: "Sidebar", value: theme.darkSidebarBg },
                                    { label: "Sidebar Active", value: theme.darkSidebarActive },
                                ]}
                                onColorChange={handleChange}
                            />
                        </div>
                    )}

                    {activeTab === "interface" && (
                        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <Palette className="text-pink-400" />
                                <div>
                                    <h2 className="text-xl font-bold">Interface & Glass</h2>
                                    <p className="mt-0.5 text-[11px] text-[var(--glass-text-muted)]">Warna diturunkan otomatis dari rule. Di sini kamu atur blur, density, dan sistem radius global untuk surface proyek.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-4">
                                    <RangeRow label="Blur Strength" value={theme.glassBlur} min={0} max={32} step={1} suffix="px" description="Seberapa halus background diblur." onChange={(value) => handleChange("glassBlur", value)} />
                                    <RangeRow label="Glass Opacity" value={theme.glassOpacity} min={0} max={1} step={0.05} description="Transparansi panel kaca." onChange={(value) => handleChange("glassOpacity", value)} />
                                    <RangeRow label="Glass Saturation" value={theme.glassSaturation} min={100} max={220} step={10} suffix="%" description="Seberapa kaya warna di balik glass." onChange={(value) => handleChange("glassSaturation", value)} />
                                </div>
                                <div className="space-y-4">
                                    <RangeRow label="Global Scale" value={theme.scale} min={0.8} max={1.2} step={0.05} description="Skala UI secara keseluruhan." onChange={(value) => handleChange("scale", value)} />
                                    <RangeRow label="Global Radius" value={theme.radius} min={0.5} max={2} step={0.125} suffix="rem" description="Mengontrol rounded-lg sampai rounded-3xl, card, modal, dock, sheet, dan radius custom utama di proyek." onChange={(value) => handleChange("radius", value)} />
                                </div>
                            </div>
                            <RadiusPreview radius={theme.radius} />
                            <GlassPreview theme={theme} isDark={isPreviewDark} onToggle={() => setIsPreviewDark((prev) => !prev)} />
                        </div>
                    )}

                    {activeTab === "typography" && (
                        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <Type className="text-blue-400" />
                                <div>
                                    <h2 className="text-xl font-bold">Typography</h2>
                                    <p className="mt-0.5 text-[11px] text-[var(--glass-text-muted)]">Heading, body, dan monospace berlaku instan ke seluruh proyek.</p>
                                </div>
                            </div>
                            <FontSelect label="Heading Font" value={theme.fontHeading ?? "Space Grotesk"} description="Dipakai untuk h1 sampai h6." onChange={(value) => handleChange("fontHeading", value)} />
                            <FontSelect label="Body Font" value={theme.fontBody ?? "Inter"} description="Dipakai untuk paragraf dan teks umum." onChange={(value) => handleChange("fontBody", value)} />
                            <FontSelect label="Monospace Font" value={theme.fontMono ?? "JetBrains Mono"} description="Dipakai untuk code dan metadata teknis." onChange={(value) => handleChange("fontMono", value)} isMono />
                            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/5 p-6 dark:bg-white/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[var(--glass-text-muted)]">Live Preview</p>
                                <h3 className="text-3xl font-bold leading-tight text-[var(--glass-text)]" style={{ fontFamily: `'${theme.fontHeading ?? "Space Grotesk"}', sans-serif` }}>The quick brown fox</h3>
                                <p className="text-sm leading-relaxed text-[var(--glass-text-muted)]" style={{ fontFamily: `'${theme.fontBody ?? "Inter"}', sans-serif` }}>Jumps over the lazy dog. 1234567890</p>
                                <code className="block text-xs text-[var(--glass-text-muted)]" style={{ fontFamily: `'${theme.fontMono ?? "JetBrains Mono"}', monospace` }}>{`const theme = "603010-auto";`}</code>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-[800px] xl:col-span-5 xl:sticky xl:top-8">
                    <FrontPagePreview theme={theme} />
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${active ? "bg-white text-black shadow-sm dark:bg-white/10 dark:text-white" : "text-black/60 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"}`}
        >
            {icon}
            {label}
        </button>
    );
}

function RuleCard({ title, description, primary, secondary, accent }: { title: string; description: string; primary: string; secondary: string; accent: string }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--site-secondary)]/10">
                    <Sparkles className="text-[var(--site-secondary)]" size={18} />
                </div>
                <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-7 text-[var(--glass-text-muted)]">{description}</p>
                </div>
            </div>
            <div className="mb-3 flex h-14 w-full overflow-hidden rounded-2xl border border-white/10 shadow-inner">
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.18em] text-white/70" style={{ backgroundColor: primary, width: "60%" }}>60%</div>
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.18em] text-black/55" style={{ backgroundColor: secondary, width: "30%" }}>30%</div>
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]" style={{ backgroundColor: accent, width: "10%" }}>10%</div>
            </div>
            <div className="grid grid-cols-1 gap-3 text-xs text-[var(--glass-text-muted)] sm:grid-cols-3">
                <p>60% untuk background dan mood utama.</p>
                <p>30% untuk surface, panel, dan nav.</p>
                <p>10% untuk CTA, glow, dan highlight.</p>
            </div>
        </div>
    );
}

function ColorSection({ title, icon, colors, generated, onColorChange }: {
    title: string;
    icon: React.ReactNode;
    colors: Array<{ key: keyof ThemeConfig; label: string; value: string; description: string }>;
    generated: Array<{ label: string; value: string }>;
    onColorChange: (key: keyof ThemeConfig, value: string | number | boolean) => void;
}) {
    return (
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                {icon}
                <div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="mt-0.5 text-[11px] text-[var(--glass-text-muted)]">Turunan UI di bawah ini dihitung otomatis dari tiga warna base.</p>
                </div>
            </div>
            <div className="space-y-3">
                {colors.map((color) => (
                    <ColorPickerRow key={String(color.key)} label={color.label} value={color.value} description={color.description} onChange={(value) => onColorChange(color.key, value)} />
                ))}
            </div>
            <div className="space-y-4 border-t border-white/10 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--glass-text-muted)]">Generated Tokens</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {generated.map((item) => (
                        <TokenCard key={item.label} label={item.label} value={item.value} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ColorPickerRow({ label, value, description, onChange }: { label: string; value: string; description: string; onChange: (value: string) => void }) {
    return (
        <div className="group flex items-center justify-between rounded-2xl border border-white/5 bg-black/5 p-3 transition-all hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10">
            <div>
                <p className="text-sm font-bold">{label}</p>
                <p className="text-[10px] text-[var(--glass-text-muted)]">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase text-[var(--glass-text-muted)]">{value}</span>
                <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-10 cursor-pointer appearance-none overflow-hidden rounded-xl border-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-xl [&::-webkit-color-swatch]:border-none" />
            </div>
        </div>
    );
}

function TokenCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/5 p-3 dark:bg-white/5">
            <span className="text-sm font-bold">{label}</span>
            <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase text-[var(--glass-text-muted)]">{value}</span>
                <span className="h-10 w-10 rounded-xl border border-white/10 shadow-inner" style={{ backgroundColor: value }} />
            </div>
        </div>
    );
}

function RangeRow({ label, value, min, max, step, onChange, suffix = "", description }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; suffix?: string; description: string }) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-black/5 p-3 transition-all hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{label}</span>
                <span className="rounded bg-white/10 px-2 py-1 font-mono text-xs text-[var(--glass-text)]">{value.toFixed(2).replace(/\.00$/, "")}{suffix}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(parseFloat(event.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-[var(--site-secondary)]" />
            <span className="text-[10px] text-[var(--glass-text-muted)]">{description}</span>
        </div>
    );
}

function RadiusPreview({ radius }: { radius: number }) {
    const examples = [
        { label: "Field", value: `${Math.max(radius - 0.1875, 0.25).toFixed(2).replace(/\.00$/, "")}rem`, style: { borderRadius: `calc(${radius}rem - 3px)` } },
        { label: "Card", value: `${(radius + 0.375).toFixed(2).replace(/\.00$/, "")}rem`, style: { borderRadius: `calc(${radius}rem + 0.375rem)` } },
        { label: "Sheet", value: `${(radius + 0.75).toFixed(2).replace(/\.00$/, "")}rem`, style: { borderRadius: `calc(${radius}rem + 0.75rem)` } },
        { label: "Dock", value: `${(radius + 1.25).toFixed(2).replace(/\.00$/, "")}rem`, style: { borderRadius: `calc(${radius}rem + 1.25rem)` } },
    ];

    return (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--glass-text-muted)]">Radius System Preview</h3>
                    <p className="mt-1 text-xs leading-6 text-[var(--glass-text-muted)]">Token radius besar dan radius custom utama ikut berubah dari satu slider ini.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 font-mono text-xs text-[var(--glass-text)] dark:bg-white/10">
                    Base {radius.toFixed(2).replace(/\.00$/, "")}rem
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {examples.map((example) => (
                    <div key={example.label} className="rounded-2xl border border-white/5 bg-black/5 p-3 dark:bg-white/5">
                        <div className="h-16 w-full border border-white/10 bg-[var(--glass-bg)] shadow-inner" style={example.style} />
                        <p className="mt-3 text-sm font-bold">{example.label}</p>
                        <p className="font-mono text-[11px] text-[var(--glass-text-muted)]">{example.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GlassPreview({ theme, isDark, onToggle }: { theme: ThemeConfig; isDark: boolean; onToggle: () => void }) {
    return (
        <div className={`relative mt-4 flex h-[300px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 p-8 transition-colors duration-500 ${isDark ? "bg-gray-900/60" : "bg-gray-100"}`}>
            <button onClick={onToggle} className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/10 p-2 backdrop-blur-md transition-all hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20" title="Toggle Preview Background">
                {isDark ? <Sun size={16} className="text-orange-400" /> : <Moon size={16} className="text-[var(--site-accent)]" />}
            </button>
            <div className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-[var(--site-accent)] opacity-60 blur-2xl" />
            <div className="absolute bottom-1/4 right-1/3 h-40 w-40 rounded-full bg-[var(--site-secondary)] opacity-50 blur-3xl" />
            <div
                style={{
                    borderRadius: `${theme.radius}rem`,
                    backdropFilter: `blur(${theme.glassBlur}px) saturate(${theme.glassSaturation}%)`,
                    WebkitBackdropFilter: `blur(${theme.glassBlur}px) saturate(${theme.glassSaturation}%)`,
                    backgroundColor: `rgba(255, 255, 255, ${theme.glassOpacity * (isDark ? 0.16 : 0.42)})`,
                }}
                className={`relative z-10 flex w-full max-w-sm flex-col items-center border px-8 py-10 text-center shadow-2xl ${isDark ? "border-white/10" : "border-black/10"}`}
            >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                    <Palette className={isDark ? "text-white" : "text-gray-900"} size={20} />
                </div>
                <h4 className={`mb-2 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Glass Preview</h4>
                <p className={`max-w-[200px] text-xs leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>Preview interaksi blur, opacity, dan saturasi di atas palette 60/30/10 yang sedang aktif.</p>
                <button style={{ borderRadius: `${theme.radius}rem` }} className="mt-6 rounded-full bg-[var(--site-button)] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.24em] text-[var(--site-button-text)]">Auto Derived</button>
            </div>
        </div>
    );
}

const SANS_FONTS = ["Inter", "Plus Jakarta Sans", "Outfit", "DM Sans", "Space Grotesk", "Geist", "Poppins", "Nunito", "Raleway", "Figtree", "Sora", "Manrope", "Be Vietnam Pro", "Urbanist", "Lexend"];
const SERIF_FONTS = ["Playfair Display", "Merriweather", "Lora", "DM Serif Display", "Cormorant Garamond", "Libre Baskerville", "Crimson Pro"];
const MONO_FONTS = ["JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono", "Cascadia Code", "Space Mono", "Roboto Mono"];
const FONT_OPTIONS = [...SANS_FONTS, ...SERIF_FONTS];

function FontSelect({ label, value, description, onChange, isMono = false }: { label: string; value: string; description: string; onChange: (value: string) => void; isMono?: boolean }) {
    const fontList = isMono ? MONO_FONTS : FONT_OPTIONS;

    useEffect(() => {
        if (typeof document === "undefined") return;
        fontList.forEach((family) => {
            const id = `gfont-admin-${family.replace(/\s+/g, "-").toLowerCase()}`;
            if (!document.getElementById(id)) {
                const link = document.createElement("link");
                link.id = id;
                link.rel = "stylesheet";
                link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s/g, "+")}:wght@400;700&display=swap`;
                document.head.appendChild(link);
            }
        });
    }, [fontList]);

    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-black/5 p-4 transition-all hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10">
            <div className="flex items-start justify-between">
                <div>
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="text-[10px] text-[var(--glass-text-muted)]">{description}</span>
                </div>
                <span className="ml-4 shrink-0 text-sm font-semibold text-[var(--glass-text-muted)]" style={{ fontFamily: `'${value}', sans-serif` }}>{value}</span>
            </div>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full cursor-pointer rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-medium text-[var(--glass-text)] focus:outline-none focus:ring-2 focus:ring-[var(--site-secondary)]/40 dark:bg-black/30" style={{ fontFamily: `'${value}', sans-serif` }}>
                {!isMono && <optgroup label="Sans-Serif">{SANS_FONTS.map((font) => <option key={font} value={font} style={{ fontFamily: `'${font}', sans-serif` }}>{font}</option>)}</optgroup>}
                {!isMono && <optgroup label="Serif">{SERIF_FONTS.map((font) => <option key={font} value={font} style={{ fontFamily: `'${font}', serif` }}>{font}</option>)}</optgroup>}
                {isMono && <optgroup label="Monospace">{MONO_FONTS.map((font) => <option key={font} value={font} style={{ fontFamily: `'${font}', monospace` }}>{font}</option>)}</optgroup>}
            </select>
        </div>
    );
}
