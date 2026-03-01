"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Package, Trash2, Plus, X, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteDigitalProduct } from "@/lib/actions/digital-product.actions";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminDigitalProductsClient({ initialProducts }: { initialProducts: any[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Delete State
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL"); // ALL, EBOOK, COURSE, etc.
    const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PUBLISHED, DRAFT

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
        let result = [...initialProducts];

        // 1. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
            );
        }

        // 2. Filters
        if (filterCategory !== "ALL") {
            result = result.filter(item => item.category === filterCategory);
        }

        if (filterStatus !== "ALL") {
            const isPub = filterStatus === "PUBLISHED";
            result = result.filter(item => item.isPublished === isPub);
        }

        // 3. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'price') {
                    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                }

                if (sortConfig.key === 'createdAt') {
                    const dateA = new Date(aValue).getTime();
                    const dateB = new Date(bValue).getTime();
                    return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
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
    }, [initialProducts, sortConfig, searchQuery, filterCategory, filterStatus]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedItems.length / rowsPerPage);
    const paginatedItems = filteredAndSortedItems.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Reset Page
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, filterCategory, filterStatus, rowsPerPage]);

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

    const performDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const result = await deleteDigitalProduct(itemToDelete);
            if (result.success) {
                toast.success("Product deleted successfully");
                setItemToDelete(null);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete product");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    // Categories derived from data
    const categories = Array.from(new Set(initialProducts.map(p => p.category))).filter(Boolean);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Digital Products</h1>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Manage e-books, courses, and other downloadable items.</p>
                </div>
                <Link
                    href={'/admin/digitalproducts/new'}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--site-button)] text-[var(--site-button-text)] rounded-xl font-bold shadow-lg shadow-[var(--site-accent)]/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
                >
                    <Plus size={18} />
                    New Product
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-5 rounded-2xl shadow-xl dark:shadow-sm transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">

                        {/* Search */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-slate-400 dark:text-gray-500 group-focus-within:text-[var(--site-accent)] transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-[var(--site-accent)]/50 transition-all font-medium placeholder:text-slate-400"
                            />
                        </div>

                        {/* Controls Group */}
                        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">

                            {/* Category Filter */}
                            <div className="relative w-full sm:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="text-slate-400 dark:text-gray-500 group-hover:text-[var(--site-accent)] transition-colors" size={16} />
                                </div>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-gray-300 font-medium text-sm focus:outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Categories</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ArrowUpDown size={14} className="text-slate-400 dark:text-gray-600" />
                                </div>
                            </div>
                            {/* Status Filter */}
                            <div className="relative w-full sm:w-48 group">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-gray-300 font-medium text-sm focus:outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="DRAFT">Draft</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ArrowUpDown size={14} className="text-slate-400 dark:text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl dark:shadow-sm transition-colors overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-slate-50/80 dark:bg-white/5 text-slate-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <SortHeader label="Title & Info" columnKey="title" />
                            <SortHeader label="Category" columnKey="category" />
                            <SortHeader label="Price" columnKey="price" />
                            <SortHeader label="Published" columnKey="isPublished" />
                            <SortHeader label="Date Added" columnKey="createdAt" />
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 dark:divide-white/5 text-slate-700 dark:text-gray-300">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item: any) => (
                                <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5 group">

                                    <td className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-gray-800 relative flex-shrink-0 border border-slate-200/50 dark:border-white/5">
                                            {(item.thumbnail || item.coverImage) ? (
                                                <Image
                                                    src={item.thumbnail || item.coverImage}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 dark:text-gray-500">IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-[var(--glass-text)] line-clamp-1">{item.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-[var(--glass-text-muted)] line-clamp-1 mt-0.5 max-w-[200px]">{item.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-[var(--site-secondary)]/10 text-[var(--site-secondary)] px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-[var(--site-secondary)]/20">
                                            {item.category || 'Product'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {item.currency} {(item.price || 0).toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center h-full pt-6">
                                        <div className={`w-3 h-3 rounded-full mr-2 ${item.isPublished ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-slate-300 dark:bg-zinc-600"}`} />
                                        <span className="text-sm font-bold">{item.isPublished ? "Yes" : "No"}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-gray-400">
                                        {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <Link href={`/admin/digitalproducts/${item.id}`} className="text-sm font-bold text-[var(--site-secondary)] hover:text-teal-500 dark:hover:text-teal-300 transition-colors">
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setItemToDelete(item.id)}
                                                className="text-sm text-red-500 hover:text-red-400 transition-colors"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <Package size={28} className="opacity-40" />
                                        </div>
                                        <p className="font-bold text-slate-700 dark:text-gray-300 text-lg">No digital products found</p>
                                        <p className="text-sm mt-1 max-w-sm">You haven't added any digital products yet, or none match your current filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 dark:bg-white/5 gap-4">
                    <div className="text-sm text-slate-500 dark:text-gray-400 font-medium whitespace-nowrap">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{filteredAndSortedItems.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedItems.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredAndSortedItems.length}</span> items
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-center sm:justify-end pb-2 sm:pb-0">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple sliding window for pagination, always show current page centered
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) {
                                        pageNum = currentPage - 3 + i + (currentPage > totalPages - 2 ? totalPages - currentPage - 2 : 0);
                                    }
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                                            ? "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                                            : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title="Delete Digital Product"
                description="Are you sure you want to delete this digital product? This action cannot be undone."
                onConfirm={performDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
