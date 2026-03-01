"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Search, Palette, X, Edit, Folder, Filter, CheckSquare, Square, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import DeleteConfirmationModal from "@/components/Admin/DeleteConfirmationModal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AppColor } from "@prisma/client";
import { createAppColor, updateAppColor, deleteAppColor, bulkDeleteAppColors } from "@/lib/actions/color.actions";
import { useRouter } from "next/navigation";
import { getPageNumbers } from "@/lib/utils/getPageNumbers";

interface AdminColorsClientProps {
    initialColors: AppColor[];
}

export default function AdminColorsClient({ initialColors }: AdminColorsClientProps) {
    const router = useRouter();
    const [colors, setColors] = useState<AppColor[]>(initialColors);

    // Feature State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterFamily, setFilterFamily] = useState("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: keyof AppColor, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingColor, setEditingColor] = useState<AppColor | null>(null);
    const [actionType, setActionType] = useState<'DELETE' | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [colorToDelete, setColorToDelete] = useState<AppColor | null>(null);

    // Form inputs
    const [formData, setFormData] = useState({
        name: "",
        hex: "#000000",
        rgb: "0, 0, 0",
        cmyk: "0, 0, 0, 100",
        family: "Gray",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Checkbox toggles
    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedColors.map(c => c.id));
        }
    };

    // Sorting
    const handleSort = (key: keyof AppColor) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter & Sort
    const filteredAndSortedColors = useMemo(() => {
        let result = [...colors];

        // 1. Search
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.hex.toLowerCase().includes(query)
            );
        }

        // 2. Filter Family
        if (filterFamily !== "ALL") {
            result = result.filter(c => c.family === filterFamily);
        }

        // 3. Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [colors, searchTerm, filterFamily, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedColors.length / rowsPerPage);
    const paginatedColors = filteredAndSortedColors.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useMemo(() => setCurrentPage(1), [searchTerm, filterFamily, rowsPerPage]);

    const families = useMemo(() => {
        const unique = new Set(initialColors.map(c => c.family));
        return Array.from(unique).sort();
    }, [initialColors]);

    const handleOpenForm = (color?: AppColor) => {
        if (color) {
            setEditingColor(color);
            setFormData({
                name: color.name,
                hex: color.hex,
                rgb: color.rgb,
                cmyk: color.cmyk,
                family: color.family,
            });
        } else {
            setEditingColor(null);
            setFormData({
                name: "",
                hex: "#000000",
                rgb: "0, 0, 0",
                cmyk: "0, 0, 0, 100",
                family: "Gray",
            });
        }
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingColor) {
                const res = await updateAppColor(editingColor.id, formData);
                if (res.success && res.data) {
                    setColors(colors.map(c => c.id === editingColor.id ? res.data : c));
                    toast.success("Color updated successfully!");
                } else {
                    toast.error(res.error || "Failed to update color");
                }
            } else {
                const res = await createAppColor(formData);
                if (res.success && res.data) {
                    setColors([res.data, ...colors]);
                    toast.success("Color created successfully!");
                } else {
                    toast.error(res.error || "Failed to create color");
                }
            }
            setIsFormOpen(false);
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const performBulkAction = async () => {
        setIsBulkProcessing(true);
        try {
            if (actionType === 'DELETE') {
                if (colorToDelete) {
                    // Single Delete from action buttons
                    const res = await deleteAppColor(colorToDelete.id);
                    if (res.success) {
                        setColors(colors.filter((c) => c.id !== colorToDelete.id));
                        toast.success("Color deleted successfully!");
                    } else {
                        toast.error(res.error || "Failed to delete color");
                    }
                    setColorToDelete(null);
                } else if (selectedIds.length > 0) {
                    // Bulk Delete
                    const result = await bulkDeleteAppColors(selectedIds);
                    if (result.success) {
                        toast.success(`Deleted ${selectedIds.length} colors`);
                        setColors(colors.filter(c => !selectedIds.includes(c.id)));
                        setSelectedIds([]);
                    } else {
                        toast.error(result.error || "Failed to bulk delete");
                    }
                }
                setActionType(null);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to perform action");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof AppColor }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[var(--site-accent)]" /> : <ArrowDown size={14} className="text-[var(--site-accent)]" />;
    };

    const SortHeader = ({ label, columnKey, className = "" }: { label: string, columnKey: keyof AppColor, className?: string }) => (
        <th className={`px-6 py-4 cursor-pointer hover:text-white transition-colors group ${className}`} onClick={() => handleSort(columnKey)}>
            <div className="flex items-center gap-2">
                {label}
                <SortIcon columnKey={columnKey} />
            </div>
        </th>
    );

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Palette className="text-[var(--site-accent)]" /> Color Database
                    </h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleOpenForm()}
                            className="flex items-center gap-2 bg-[var(--site-button)] hover:opacity-90 text-[var(--site-button-text)] px-4 py-2 rounded-lg transition-all font-medium shadow-lg shadow-[var(--site-accent)]/20"
                        >
                            <Plus size={18} /> Add Color
                        </button>
                    </div>
                </div>

                {/* Filters Box */}
                <div className="bg-white/80 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        {/* Search Input */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--site-secondary)] transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or HEX..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-[var(--site-accent)]/40 dark:focus:border-[var(--site-secondary)]/50 transition-all duration-300"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                            {/* Family Filter */}
                            <div className="relative w-full sm:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Folder className="text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" size={16} />
                                </div>
                                <select
                                    value={filterFamily}
                                    onChange={(e) => setFilterFamily(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-accent)]/40 dark:focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-white dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Families</option>
                                    {families.map(fam => (
                                        <option key={fam} value={fam}>{fam}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Filter size={14} className="text-gray-400 dark:text-gray-600" />
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            <div className="relative w-full sm:w-32 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Show</span>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={rowsPerPage}
                                    onChange={(e) => setRowsPerPage(Math.max(1, parseInt(e.target.value) || 10))}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-accent)]/40 dark:focus:border-teal-500/50 appearance-none hover:bg-white dark:hover:bg-black/30 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white/90 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-md dark:shadow-xl transition-colors overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <button onClick={toggleSelectAll} className="flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                    {selectedIds.length === paginatedColors.length && paginatedColors.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-6 py-4">Preview</th>
                            <SortHeader label="Name" columnKey="name" />
                            <SortHeader label="HEX" columnKey="hex" />
                            <SortHeader label="Family" columnKey="family" />
                            <SortHeader label="Date Added" columnKey="createdAt" />
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {paginatedColors.length > 0 ? (
                            paginatedColors.map((color) => (
                                <tr key={color.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(color.id) ? "bg-[var(--site-accent)]/5" : ""}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelect(color.id)} className={`flex items-center ${selectedIds.includes(color.id) ? "text-[var(--site-accent)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"}`}>
                                            {selectedIds.includes(color.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className="w-12 h-12 rounded-lg shadow-inner ring-2 ring-white/10"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[var(--site-secondary)] transition-colors">{color.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs space-y-1">
                                            <span className="font-mono text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded uppercase w-fit">{color.hex}</span>
                                            <span className="text-gray-400">RGB: {color.rgb}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {color.family}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(color.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2 justify-end">
                                        <button onClick={() => handleOpenForm(color)} className="p-2 rounded-lg text-[var(--site-accent)] hover:bg-[var(--site-accent)]/10 transition-colors" title="Edit Color">
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setColorToDelete(color);
                                                setActionType('DELETE');
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete Color"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <Search size={24} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No colors found</p>
                                        <p className="text-xs">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + (paginatedColors.length > 0 ? 1 : 0)}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedColors.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedColors.length}</span> colors
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 pb-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {getPageNumbers(currentPage, totalPages).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === p
                                        ? "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 pb-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={actionType === 'DELETE' && (selectedIds.length > 0 || colorToDelete !== null)}
                onClose={() => {
                    setActionType(null);
                    setColorToDelete(null);
                }}
                onConfirm={performBulkAction}
                isDeleting={isBulkProcessing}
                count={selectedIds.length > 0 ? selectedIds.length : 1}
                description={
                    colorToDelete
                        ? `Are you sure you want to delete ${colorToDelete.name}? This action cannot be undone.`
                        : `Are you sure you want to delete ${selectedIds.length} selected colors? This action cannot be undone.`
                }
            />

            {/* Floating Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className="bg-[#1A1A1A] border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                                <span className="text-white font-bold">{selectedIds.length}</span>
                                <span className="text-gray-400 text-sm">Selected</span>
                                <button onClick={() => setSelectedIds([])} className="bg-white/10 hover:bg-white/20 p-1 rounded-full transition-colors ml-2">
                                    <X size={14} className="text-white" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActionType('DELETE')}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full text-sm font-medium transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <Trash2 size={16} />
                                    Delete All
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FORM MODAL for Single Edit/Create */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Palette size={20} className="text-[var(--site-accent)]" />
                                    {editingColor ? "Edit Color" : "New Color"}
                                </h3>
                                <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-gray-900 dark:text-gray-100">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Color Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--site-accent)] dark:focus:border-[var(--site-accent)]"
                                        placeholder="e.g. Cherry Red"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">HEX Code</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.hex}
                                            onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--site-accent)] uppercase font-mono"
                                            placeholder="#FF0000"
                                        />
                                    </div>
                                    <div className="shrink-0 pt-6">
                                        <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/20 shadow-inner" style={{ backgroundColor: formData.hex }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">RGB</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.rgb}
                                        onChange={(e) => setFormData({ ...formData, rgb: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--site-accent)]"
                                        placeholder="255, 0, 0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">CMYK</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cmyk}
                                        onChange={(e) => setFormData({ ...formData, cmyk: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--site-accent)]"
                                        placeholder="0, 100, 100, 0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Family</label>
                                    <select
                                        value={formData.family}
                                        onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:border-[var(--site-accent)]"
                                    >
                                        <option value="Red">Red</option>
                                        <option value="Orange">Orange</option>
                                        <option value="Yellow">Yellow</option>
                                        <option value="Green">Green</option>
                                        <option value="Teal">Teal</option>
                                        <option value="Blue">Blue</option>
                                        <option value="Purple">Purple</option>
                                        <option value="Pink">Pink</option>
                                        <option value="Brown">Brown</option>
                                        <option value="Gray">Gray</option>
                                        <option value="White">White</option>
                                        <option value="Black">Black</option>
                                    </select>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors font-medium border border-gray-200 dark:border-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 rounded-xl bg-[var(--site-accent)] hover:opacity-90 text-[var(--site-button-text)] transition-all font-medium disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Saving..." : "Save Color"}
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
