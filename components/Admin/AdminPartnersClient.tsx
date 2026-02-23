"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, Trash2, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { bulkDeletePartners } from "@/lib/actions/partner.actions";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

export default function AdminPartnersClient({ partners }: { partners: any[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");

    // Bulk Action State
    const [actionType, setActionType] = useState<'DELETE' | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
            setSelectedIds(filteredAndSortedPartners.map(p => p.id));
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedPartners = useMemo(() => {
        let result = [...partners];

        // 1. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(partner =>
                partner.name?.toLowerCase().includes(query) ||
                partner.url?.toLowerCase().includes(query)
            );
        }

        // 2. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'createdAt') {
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [partners, sortConfig, searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedPartners.length / rowsPerPage);
    const paginatedPartners = filteredAndSortedPartners.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, rowsPerPage]);

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

    const performBulkAction = async () => {
        setIsBulkProcessing(true);
        try {
            if (actionType === 'DELETE') {
                const result = (await bulkDeletePartners(selectedIds)) as any;
                if (result.success) {
                    toast.success(`Deleted ${selectedIds.length} partners`);
                    setSelectedIds([]);
                    setActionType(null);
                    router.refresh();
                } else {
                    toast.error(result.error);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to perform action");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    return (
        <div>
            {/* Header with New Partner Button */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Partners
                    </h1>
                </div>

                <Link
                    href="/admin/partners/new"
                    className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-teal-500/20"
                >
                    <Plus size={18} />
                    New Partner
                </Link>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                {/* Search and Filters Card */}
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        {/* Search Input */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search partners..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-teal-500/50 transition-all"
                            />
                        </div>

                        {/* Rows Per Page */}
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
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-teal-500/50 appearance-none hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <button onClick={toggleSelectAll} className="flex items-center text-gray-400 hover:text-white transition-colors">
                                    {selectedIds.length === paginatedPartners.length && paginatedPartners.length > 0 ? <CheckSquare size={18} className="text-[var(--site-accent)]" /> : <Square size={18} />}
                                </button>
                            </th>
                            <SortHeader label="Partner" columnKey="name" />
                            <SortHeader label="URL" columnKey="url" />
                            <SortHeader label="Created" columnKey="createdAt" />
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {paginatedPartners.length > 0 ? (
                            paginatedPartners.map((partner) => (
                                <tr key={partner.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(partner.id) ? "bg-[var(--site-accent)]/5" : ""}`}>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleSelect(partner.id)}
                                            className={`flex items-center ${selectedIds.includes(partner.id) ? "text-[var(--site-accent)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"}`}
                                        >
                                            {selectedIds.includes(partner.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700/50 relative flex-shrink-0 border border-white/5">
                                            {partner.icon ? (
                                                <Image
                                                    src={partner.icon}
                                                    alt={partner.name}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Img</div>
                                            )}
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{partner.name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--site-accent)] max-w-xs truncate">
                                        {partner.url && (
                                            <a href={partner.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                {partner.url}
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(partner.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/partners/${partner.id}`} className="text-sm text-[var(--site-accent)] hover:underline mr-3 font-medium transition-colors">Edit</Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <Search size={24} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No partners found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedPartners.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedPartners.length}</span> partners
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
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    p = currentPage - 2 + i;
                                    if (p > totalPages) p = totalPages - (4 - i);
                                }
                                return (
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
                                );
                            })}
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
                isOpen={actionType === 'DELETE' && selectedIds.length > 0}
                onClose={() => setActionType(null)}
                onConfirm={performBulkAction}
                isDeleting={isBulkProcessing}
                count={selectedIds.length}
                description={`Are you sure you want to delete ${selectedIds.length} selected partners? This action cannot be undone.`}
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

                            <button
                                onClick={() => setActionType('DELETE')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-full text-sm font-bold shadow-lg shadow-red-500/20 transition-colors"
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
