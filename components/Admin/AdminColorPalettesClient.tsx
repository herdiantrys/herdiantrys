"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Search, Layers, X, Edit, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createAppPalette, updateAppPalette, deleteAppPalette } from "@/lib/actions/color.actions";
import { useRouter } from "next/navigation";
import DeleteConfirmationModal from "@/components/Admin/DeleteConfirmationModal";

type AppColor = { id: string; name: string; hex: string; family: string };
type AppPalette = { id: string; name: string; colors: any; tags: any; createdAt: Date; updatedAt: Date };

interface AdminColorPalettesClientProps {
    initialPalettes: AppPalette[];
    allColors: AppColor[];
}

export default function AdminColorPalettesClient({ initialPalettes, allColors }: AdminColorPalettesClientProps) {
    const router = useRouter();
    const [palettes, setPalettes] = useState<AppPalette[]>(initialPalettes);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPalette, setEditingPalette] = useState<AppPalette | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paletteToDelete, setPaletteToDelete] = useState<AppPalette | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedHex, setCopiedHex] = useState<string | null>(null);

    // Form state
    const [paletteName, setPaletteName] = useState("");
    const [selectedHexes, setSelectedHexes] = useState<string[]>([]);
    const [tagsInput, setTagsInput] = useState("");
    const [colorSearch, setColorSearch] = useState("");
    const [filterFamily, setFilterFamily] = useState("ALL");

    const families = useMemo(() => {
        const unique = new Set(allColors.map(c => c.family));
        return ["ALL", ...Array.from(unique).sort()];
    }, [allColors]);

    const filteredDbColors = useMemo(() => {
        return allColors.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(colorSearch.toLowerCase()) || c.hex.toLowerCase().includes(colorSearch.toLowerCase());
            const matchFamily = filterFamily === "ALL" || c.family === filterFamily;
            return matchSearch && matchFamily;
        });
    }, [allColors, colorSearch, filterFamily]);

    const filteredPalettes = useMemo(() => {
        if (!searchTerm) return palettes;
        const q = searchTerm.toLowerCase();
        return palettes.filter(p => p.name.toLowerCase().includes(q));
    }, [palettes, searchTerm]);

    const openCreateForm = () => {
        setEditingPalette(null);
        setPaletteName("");
        setSelectedHexes([]);
        setTagsInput("");
        setColorSearch("");
        setFilterFamily("ALL");
        setIsFormOpen(true);
    };

    const openEditForm = (palette: AppPalette) => {
        setEditingPalette(palette);
        setPaletteName(palette.name);
        setSelectedHexes(Array.isArray(palette.colors) ? palette.colors : []);
        setTagsInput(Array.isArray(palette.tags) ? palette.tags.join(", ") : "");
        setColorSearch("");
        setFilterFamily("ALL");
        setIsFormOpen(true);
    };

    const toggleColorInPalette = (hex: string) => {
        setSelectedHexes(prev =>
            prev.includes(hex) ? prev.filter(h => h !== hex) : [...prev, hex]
        );
    };

    const removeColorFromPalette = (hex: string) => {
        setSelectedHexes(prev => prev.filter(h => h !== hex));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedHexes.length === 0) {
            toast.error("Please select at least one color for the palette.");
            return;
        }
        setIsSubmitting(true);
        const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
        const data = {
            name: paletteName,
            colors: JSON.stringify(selectedHexes),
            tags: JSON.stringify(tags),
        };
        try {
            if (editingPalette) {
                const res = await updateAppPalette(editingPalette.id, data) as any;
                if (res.success && res.data) {
                    setPalettes(prev => prev.map(p => p.id === editingPalette.id ? res.data : p));
                    toast.success("Palette updated!");
                } else {
                    toast.error(res.error || "Failed to update palette");
                }
            } else {
                const res = await createAppPalette(data) as any;
                if (res.success && res.data) {
                    setPalettes(prev => [res.data, ...prev]);
                    toast.success("Palette created!");
                } else {
                    toast.error(res.error || "Failed to create palette");
                }
            }
            setIsFormOpen(false);
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!paletteToDelete) return;
        setIsDeleting(true);
        const res = await deleteAppPalette(paletteToDelete.id) as any;
        if (res.success) {
            setPalettes(prev => prev.filter(p => p.id !== paletteToDelete.id));
            toast.success("Palette deleted.");
        } else {
            toast.error(res.error || "Failed to delete palette");
        }
        setPaletteToDelete(null);
        setIsDeleting(false);
        router.refresh();
    };

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        toast.success(`Copied ${hex}`);
        setTimeout(() => setCopiedHex(null), 2000);
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Layers className="text-purple-500" /> Color Palettes
                </h1>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 bg-[var(--site-button)] hover:opacity-90 text-[var(--site-button-text)] px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
                >
                    <Plus size={18} /> New Palette
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-4 rounded-2xl shadow-sm mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search palettes..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Palette Grid */}
            {filteredPalettes.length === 0 ? (
                <div className="py-20 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-[#1A1A1A]/60 rounded-2xl border border-gray-200 dark:border-white/5">
                    <Layers size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No palettes found</p>
                    <p className="text-sm mt-1">Create your first color palette using the button above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredPalettes.map(palette => {
                            const colors: string[] = Array.isArray(palette.colors) ? palette.colors : [];
                            const tags: string[] = Array.isArray(palette.tags) ? palette.tags : [];
                            return (
                                <motion.div
                                    key={palette.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white dark:bg-[#1A1A1A]/80 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow group"
                                >
                                    {/* Color Strip */}
                                    <div className="flex h-20 w-full">
                                        {colors.map((hex, i) => (
                                            <button
                                                key={i}
                                                className="flex-1 relative group/color hover:scale-105 transition-transform z-10 hover:z-20"
                                                style={{ backgroundColor: hex }}
                                                onClick={() => handleCopy(hex)}
                                                title={`Copy ${hex}`}
                                            >
                                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm text-white text-[10px] font-bold">
                                                    {copiedHex === hex ? <Check size={12} /> : <Copy size={12} />}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{palette.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {colors.length} color{colors.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => openEditForm(palette)}
                                                    className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                                                    title="Edit Palette"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setPaletteToDelete(palette)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete Palette"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hex swatches */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {colors.map((hex, i) => (
                                                <span
                                                    key={i}
                                                    className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                                    onClick={() => handleCopy(hex)}
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 ring-1 ring-black/10" style={{ backgroundColor: hex }} />
                                                    {hex}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Tags */}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={!!paletteToDelete}
                onClose={() => setPaletteToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                count={1}
                description={`Are you sure you want to delete "${paletteToDelete?.name}"? This cannot be undone.`}
            />

            {/* FORM MODAL */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 shrink-0">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Layers size={20} className="text-purple-500" />
                                    {editingPalette ? "Edit Palette" : "New Palette"}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
                                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                    {/* Palette Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Palette Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={paletteName}
                                            onChange={e => setPaletteName(e.target.value)}
                                            placeholder="e.g. Ocean Breeze"
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags <span className="text-gray-400">(comma separated)</span></label>
                                        <input
                                            type="text"
                                            value={tagsInput}
                                            onChange={e => setTagsInput(e.target.value)}
                                            placeholder="nature, calm, blue"
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    {/* Selected Colors Preview */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selected Colors <span className="text-gray-400">({selectedHexes.length})</span>
                                        </label>
                                        {selectedHexes.length === 0 ? (
                                            <div className="h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center text-sm text-gray-400">
                                                No colors selected — pick from below
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {/* Color bar preview */}
                                                <div className="flex h-14 rounded-xl overflow-hidden shadow-inner ring-1 ring-black/5 dark:ring-white/5">
                                                    {selectedHexes.map((hex, i) => (
                                                        <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
                                                    ))}
                                                </div>
                                                {/* Selected swatches with remove button */}
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedHexes.map((hex, i) => (
                                                        <div key={i} className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1">
                                                            <span className="w-4 h-4 rounded shrink-0 ring-1 ring-black/10" style={{ backgroundColor: hex }} />
                                                            <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300">{hex}</span>
                                                            <button type="button" onClick={() => removeColorFromPalette(hex)} className="text-gray-400 hover:text-red-500 transition-colors ml-0.5">
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Color Picker from DB */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pick Colors from Database</label>
                                        <div className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                                            {/* Search & Filter */}
                                            <div className="flex gap-3 mb-4">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search colors..."
                                                        value={colorSearch}
                                                        onChange={e => setColorSearch(e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all"
                                                    />
                                                </div>
                                                <select
                                                    value={filterFamily}
                                                    onChange={e => setFilterFamily(e.target.value)}
                                                    className="px-3 py-2 text-sm bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 outline-none focus:border-purple-500 transition-all"
                                                >
                                                    {families.map(f => (
                                                        <option key={f} value={f}>{f === "ALL" ? "All Families" : f}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Color Grid */}
                                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                                {filteredDbColors.map(color => {
                                                    const isSelected = selectedHexes.includes(color.hex);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={color.id}
                                                            onClick={() => toggleColorInPalette(color.hex)}
                                                            title={`${color.name} (${color.hex})`}
                                                            className={`aspect-square rounded-lg relative group/swatch transition-all ${isSelected ? "ring-2 ring-offset-1 ring-purple-500 scale-95" : "hover:scale-105 ring-1 ring-black/10 dark:ring-white/10"}`}
                                                            style={{ backgroundColor: color.hex }}
                                                        >
                                                            {isSelected && (
                                                                <span className="absolute inset-0 flex items-center justify-center">
                                                                    <Check size={14} className="text-white drop-shadow-md" />
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                                {filteredDbColors.length === 0 && (
                                                    <div className="col-span-full py-6 text-center text-sm text-gray-400">No colors match your search.</div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3">{filteredDbColors.length} colors shown · Click to toggle selection</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 pt-4 border-t border-gray-200 dark:border-white/10 flex gap-3 shrink-0 bg-gray-50 dark:bg-black/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors font-medium border border-gray-200 dark:border-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all font-medium disabled:opacity-50 shadow-lg shadow-purple-500/25"
                                    >
                                        {isSubmitting ? "Saving..." : editingPalette ? "Update Palette" : "Create Palette"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
