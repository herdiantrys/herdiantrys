"use client";

import { useState, useMemo } from "react";
import { Search, Copy, Check, Palette, Filter, RefreshCcw, Layers, Aperture } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import InteractiveColorWheel from "@/components/ColorSpace/InteractiveColorWheel";

type ColorSpaceProps = {
    colorsData: Array<{ id: string; name: string; hex: string; rgb: string; cmyk: string; family: string; }>;
    palettesData: Array<{ id: string; name: string; colors: any; tags: any; }>;
};

export default function ColorSpaceClient({ colorsData, palettesData }: ColorSpaceProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
    const [copiedValue, setCopiedValue] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"solid" | "palettes" | "wheel">("solid");

    // Extract unique families for filter
    const families = useMemo(() => {
        const unique = Array.from(new Set(colorsData.map(c => c.family)));
        return unique.sort();
    }, [colorsData]);

    // Filter Logic
    const filteredColors = useMemo(() => {
        return colorsData.filter(color => {
            const matchesSearch =
                color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                color.hex.toLowerCase().includes(searchQuery.toLowerCase()) ||
                color.rgb.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFamily = selectedFamily ? color.family === selectedFamily : true;

            return matchesSearch && matchesFamily;
        });
    }, [searchQuery, selectedFamily, colorsData]);

    // Palette Filter Logic
    const filteredPalettes = useMemo(() => {
        return palettesData.filter(palette => {
            const tagsList = Array.isArray(palette.tags) ? palette.tags : [];
            return palette.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tagsList.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        });
    }, [searchQuery, palettesData]);

    // Copy Handler
    const handleCopy = (value: string, type: string) => {
        navigator.clipboard.writeText(value);
        setCopiedValue(value);
        toast.success(`Copied to clipboard!`, {
            description: `${type}: ${value}`,
            icon: <Copy size={16} />,
        });

        setTimeout(() => {
            setCopiedValue(null);
        }, 2000);
    };

    return (
        <main className="min-h-screen pt-28 pb-20 relative overflow-hidden bg-[var(--site-bg)]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/apps" className="inline-flex items-center text-sm font-medium text-[var(--site-secondary)] hover:text-teal-400 transition-colors mb-6">
                        ← Back to Apps
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                            <Palette size={24} />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--glass-text)] tracking-tight">
                            Color Space
                        </h1>
                    </div>
                    <p className="text-lg text-[var(--glass-text-muted)] max-w-2xl">
                        A comprehensive database of professional colors. Instantly search, filter, and grab HEX, RGB, or CMYK codes for your next design project.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-4 mb-4 border-b border-gray-200 dark:border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab("solid")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "solid"
                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                            : "bg-transparent text-[var(--glass-text-muted)] hover:bg-white/5"
                            }`}
                    >
                        <Palette size={20} /> Solid Colors
                    </button>
                    <button
                        onClick={() => setActiveTab("palettes")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "palettes"
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-transparent text-[var(--glass-text-muted)] hover:bg-white/5"
                            }`}
                    >
                        <Layers size={20} /> Color Palettes
                    </button>
                    <button
                        onClick={() => setActiveTab("wheel")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "wheel"
                            ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg shadow-orange-500/25"
                            : "bg-transparent text-[var(--glass-text-muted)] hover:bg-white/5"
                            }`}
                    >
                        <Aperture size={20} /> Color Wheel
                    </button>
                </div>

                {/* Toolbar */}
                {activeTab !== "wheel" && (
                    <div className="glass-liquid bg-white/5 dark:bg-black/20 border border-[var(--glass-border)] rounded-2xl p-4 sm:p-6 shadow-xl mb-8 sticky top-24 z-30 backdrop-blur-3xl">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

                            {/* Search Input */}
                            <div className="relative w-full lg:max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, HEX, or RGB..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-[var(--glass-text)] placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                                />
                            </div>

                            {/* Family Filters */}
                            {activeTab === "solid" && (
                                <div className="w-full lg:w-auto overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
                                    <div className="flex items-center gap-2 min-w-max">
                                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--glass-text-muted)] mr-2">
                                            <Filter size={16} /> Filters:
                                        </div>
                                        <button
                                            onClick={() => setSelectedFamily(null)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFamily === null
                                                ? "bg-[var(--site-secondary)] text-white shadow-md shadow-teal-500/25"
                                                : "bg-white/5 border border-[var(--glass-border)] text-[var(--glass-text)] hover:bg-white/10"
                                                }`}
                                        >
                                            All
                                        </button>
                                        {families.map(family => (
                                            <button
                                                key={family}
                                                onClick={() => setSelectedFamily(family)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFamily === family
                                                    ? "bg-[var(--site-secondary)] text-white shadow-md shadow-teal-500/25"
                                                    : "bg-white/5 border border-[var(--glass-border)] text-[var(--glass-text)] hover:bg-white/10"
                                                    }`}
                                            >
                                                {family}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Results View */}
                {activeTab === "wheel" ? (
                    <InteractiveColorWheel />
                ) : activeTab === "solid" ? (
                    filteredColors.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 border border-dashed border-white/20 rounded-full flex items-center justify-center mb-6 text-[var(--glass-text-muted)]">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--glass-text)] mb-2">No Colors Found</h3>
                            <p className="text-[var(--glass-text-muted)] mb-6">Could not find any colors matching your search criteria.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedFamily(null); }}
                                className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 border border-[var(--glass-border)] rounded-xl text-sm font-medium text-[var(--glass-text)] transition-colors"
                            >
                                <RefreshCcw size={16} /> Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            <AnimatePresence>
                                {filteredColors.map((color) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        key={color.id}
                                        className="group glass-liquid bg-white/5 dark:bg-black/20 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div
                                            className="h-32 w-full relative transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundColor: color.hex }}
                                        >
                                            {(color.family === "White" || color.family === "Yellow") && (
                                                <div className="absolute inset-0 border-b border-black/5" />
                                            )}
                                        </div>

                                        <div className="p-5 relative bg-white dark:bg-zinc-900/80 backdrop-blur-md">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate pr-2 tracking-tight">{color.name}</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2 py-1 rounded-md shrink-0">
                                                    {color.family}
                                                </span>
                                            </div>

                                            <div className="space-y-2.5">
                                                <CopyRow label="HEX" value={color.hex} onCopy={() => handleCopy(color.hex, "HEX")} isCopied={copiedValue === color.hex} />
                                                <CopyRow label="RGB" value={color.rgb} onCopy={() => handleCopy(color.rgb, "RGB")} isCopied={copiedValue === color.rgb} />
                                                <CopyRow label="CMYK" value={color.cmyk} onCopy={() => handleCopy(color.cmyk, "CMYK")} isCopied={copiedValue === color.cmyk} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                ) : (
                    filteredPalettes.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-white/5 border border-dashed border-white/20 rounded-full flex items-center justify-center mb-6 text-[var(--glass-text-muted)]">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--glass-text)] mb-2">No Palettes Found</h3>
                            <p className="text-[var(--glass-text-muted)] mb-6">Could not find any palettes matching your search criteria.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 border border-[var(--glass-border)] rounded-xl text-sm font-medium text-[var(--glass-text)] transition-colors"
                            >
                                <RefreshCcw size={16} /> Clear Search
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {filteredPalettes.map(palette => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        key={palette.id}
                                        className="group glass-liquid bg-white/5 dark:bg-black/20 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-lg p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate pr-2 tracking-tight">{palette.name}</h3>
                                        </div>

                                        <div className="flex h-24 rounded-xl overflow-hidden shadow-inner mb-4">
                                            {(Array.isArray(palette.colors) ? palette.colors : []).map((c: string, i: number) => (
                                                <button
                                                    key={i}
                                                    className="flex-1 transition-transform hover:scale-110 relative group/color z-10 hover:z-20"
                                                    style={{ backgroundColor: c }}
                                                    onClick={() => handleCopy(c, "HEX")}
                                                    title={`Copy ${c}`}
                                                >
                                                    <span className="opacity-0 group-hover/color:opacity-100 absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md bg-black/20 backdrop-blur-sm transition-opacity">
                                                        {copiedValue === c ? <Check size={14} /> : 'Copy'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(Array.isArray(palette.tags) ? palette.tags : []).map((tag: string) => (
                                                <span key={tag} className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleCopy(`["${(palette.colors as string[]).join('", "')}"]`, "Array")}
                                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] rounded-lg text-xs font-medium text-[var(--glass-text)] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Copy size={14} /> Copy Array
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                )}
            </div>
        </main>
    );
}

function CopyRow({ label, value, onCopy, isCopied }: { label: string, value: string, onCopy: () => void, isCopied: boolean }) {
    return (
        <button
            onClick={onCopy}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/row text-left border border-transparent hover:border-gray-200 dark:hover:border-white/10"
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 shrink-0 w-8">{label}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate font-mono">{value}</span>
            </div>
            {isCopied ? (
                <Check size={14} className="text-teal-500 shrink-0" />
            ) : (
                <Copy size={14} className="text-gray-400 dark:text-gray-500 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0" />
            )}
        </button>
    );
}
