"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Package, Trash2, Plus, X, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteShopItem, bulkDeleteShopItems } from "@/lib/actions/shop.actions";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminShopClient({ items, currentUserId }: { items: any[], currentUserId?: string }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Delete State
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'price', direction: 'asc' });

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL"); // ALL, COSMETICS, DESIGNS, COURSES, APPS
    const [filterType, setFilterType] = useState("ALL");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sorting Logic
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filtering & Sorting
    const filteredAndSortedItems = useMemo(() => {
        let result = [...items];

        // 1. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.value?.toLowerCase().includes(query)
            );
        }

        // 2. Filters
        if (filterCategory !== "ALL") {
            result = result.filter(item => (item.category || 'cosmetics') === filterCategory.toLowerCase());
        }

        if (filterType !== "ALL") {
            result = result.filter(item => item.type === filterType);
        }

        // 3. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'price') {
                    // Number sort
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }

                // String sort
                aValue = (aValue || '').toString().toLowerCase();
                bValue = (bValue || '').toString().toLowerCase();

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [items, sortConfig, searchQuery, filterCategory, filterType]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedItems.length / rowsPerPage);
    const paginatedItems = filteredAndSortedItems.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Reset Page
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, filterCategory, rowsPerPage]);

    // Helper Components
    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-teal-400" /> : <ArrowDown size={14} className="text-teal-400" />;
    };

    const SortHeader = ({ label, columnKey, className = "" }: { label: string, columnKey: string, className?: string }) => (
        <th className={`px-6 py-4 cursor-pointer hover:text-white transition-colors group ${className}`} onClick={() => handleSort(columnKey)}>
            <div className="flex items-center gap-2">
                {label}
                <SortIcon columnKey={columnKey} />
            </div>
        </th>
    );

    // Selection Handlers
    const handleSelectAll = () => {
        if (selectedIds.length === paginatedItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedItems.map(p => p.id));
        }
    };

    const handleSelectRow = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const performBulkDelete = async () => {
        if (!currentUserId) {
            toast.error("Unauthorized");
            return;
        }

        setIsBulkProcessing(true);
        try {
            const result = await bulkDeleteShopItems(selectedIds, currentUserId);
            if (result.success) {
                toast.success(`Deleted ${selectedIds.length} items`);
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete items");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Shop Management</h1>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">

                        {/* Search */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-teal-500/50 transition-all"
                            />
                        </div>

                        {/* Controls Group */}
                        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">

                            {/* Category Filter */}
                            <div className="relative w-full sm:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors" size={16} />
                                </div>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Categories</option>
                                    <option value="COSMETICS">Cosmetics</option>
                                    <option value="DESIGNS">Designs</option>
                                    <option value="COURSES">Courses</option>
                                    <option value="APPS">Apps</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ArrowUpDown size={14} className="text-gray-400 dark:text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden overflow-x-auto border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 w-4">
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    {paginatedItems.length > 0 && selectedIds.length === paginatedItems.length ? (
                                        <CheckSquare size={18} className="text-teal-400" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                </button>
                            </th>
                            <SortHeader label="Item" columnKey="name" />
                            <SortHeader label="Category" columnKey="category" />
                            <SortHeader label="Type" columnKey="type" />
                            <SortHeader label="Price" columnKey="price" />
                            <th className="px-6 py-4">Value</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item: any) => (
                                <tr key={item.id} className={`transition-colors ${selectedIds.includes(item.id) ? 'bg-teal-500/10 hover:bg-teal-500/20' : 'hover:bg-[var(--glass-border)]'}`}>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleSelectRow(item.id)}
                                            className="flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                        >
                                            {selectedIds.includes(item.id) ? (
                                                <CheckSquare size={18} className="text-teal-500" />
                                            ) : (
                                                <Square size={18} />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700/50 relative flex-shrink-0 border border-white/5">
                                            {item.icon ? (
                                                <Image
                                                    src={item.icon}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--glass-text)]">{item.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase">
                                            {item.category || 'Cosmetics'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-yellow-500">
                                        {item.price} pts
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400 truncate max-w-[100px]">
                                        {item.value || "-"}
                                    </td>
                                    <td className="px-6 py-4 flex items-center">
                                        <Link href={`/admin/shop/${item.id}`} className="text-sm text-teal-400 hover:text-teal-300 mr-3">Edit</Link>
                                        <button
                                            onClick={() => setItemToDelete(item.id)}
                                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-[var(--glass-text-muted)]">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-[var(--glass-border)] flex items-center justify-center mb-2">
                                            <Package size={24} opacity={0.5} />
                                        </div>
                                        <p className="font-medium">No items found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedItems.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedItems.length}</span> items
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
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
                                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                                        }`}
                                >
                                    {i + 1}
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
                isOpen={!!itemToDelete || selectedIds.length > 0}
                onClose={() => { setItemToDelete(null); if (selectedIds.length === 0) return; }}
                // Note: Logic allows bulk modal if desired, but here we simplify
                onConfirm={async () => {
                    // Check if Single Delete or Bulk Delete
                    if (selectedIds.length > 0 && !itemToDelete) {
                        await performBulkDelete();
                        return;
                    }

                    if (!itemToDelete || !currentUserId) {
                        if (!currentUserId) toast.error("Unauthorized");
                        return;
                    }

                    setIsDeleting(true);
                    try {
                        const result = await deleteShopItem(itemToDelete, currentUserId);
                        if (result?.success) {
                            toast.success("Item deleted successfully");
                            setItemToDelete(null);
                            router.refresh();
                        } else {
                            toast.error(result?.error || "Failed to delete item");
                        }
                    } catch (error) {
                        toast.error("An error occurred");
                    } finally {
                        setIsDeleting(false);
                    }
                }}
                isDeleting={isDeleting || isBulkProcessing}
                count={selectedIds.length > 0 && !itemToDelete ? selectedIds.length : 1}
                description={selectedIds.length > 0 && !itemToDelete ? `Delete ${selectedIds.length} items?` : undefined}
            />

            {/* Floating Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && !itemToDelete && (
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

                            <button
                                onClick={performBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-full text-sm font-bold shadow-lg shadow-red-500/20 transition-colors"
                                disabled={isBulkProcessing}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
