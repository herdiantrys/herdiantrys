"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, Trash2, CheckSquare, Square, ExternalLink, Loader2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { bulkDeleteNotifications } from "@/lib/actions/notification.actions";
import Link from "next/link";
import Image from "next/image";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";

interface Notification {
    id: string;
    type: string;
    read: boolean;
    createdAt: Date;
    recipient: { id: string; name: string | null; username: string | null; image: string | null; imageURL: string | null };
    sender: { id: string; name: string | null; username: string | null; image: string | null; imageURL: string | null };
    details?: any;
    context?: { type: string; id: string; title?: string; text?: string } | null;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export default function AdminNotificationsClient({
    initialNotifications,
    pagination
}: {
    initialNotifications: Notification[],
    pagination: PaginationProps
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // URL State
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [filterType, setFilterType] = useState(searchParams.get('type') || "ALL");
    const [filterRead, setFilterRead] = useState(searchParams.get('read') || "ALL");
    const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get('limit') || "10"));

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        } else {
            params.delete('search');
        }

        if (filterType !== "ALL") {
            params.set('type', filterType);
        } else {
            params.delete('type');
        }

        if (filterRead !== "ALL") {
            params.set('read', filterRead);
        } else {
            params.delete('read');
        }

        if (rowsPerPage !== 10) {
            params.set('limit', rowsPerPage.toString());
        } else {
            params.delete('limit');
        }

        params.set('page', '1');

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [debouncedSearch, filterType, filterRead, rowsPerPage, pathname, router]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

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
            setSelectedIds(initialNotifications.map(n => n.id));
        }
    };

    const handleDelete = async () => {
        setIsBulkProcessing(true);
        const result = (await bulkDeleteNotifications(selectedIds)) as any;
        if (result.success) {
            toast.success(`Deleted ${selectedIds.length} notifications`);
            setSelectedIds([]);
            setIsDeleteModalOpen(false);
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setIsBulkProcessing(false);
    };

    const NotificationTypeStyles: Record<string, string> = {
        like_post: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
        comment_post: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
        follow: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
        system: "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400",
        xp_award: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
        coin_award: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
        achievement: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
        badge_awarded: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    };

    return (
        <div className="relative">
            {/* Toolbar */}
            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors mb-6">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full lg:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--site-secondary)] transition-colors" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-[var(--site-secondary)]/50 transition-all duration-300"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        {/* Type Filter */}
                        <div className="relative w-full sm:w-40 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="text-gray-400 dark:text-gray-500" size={16} />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                            >
                                <option value="ALL">All Types</option>
                                <option value="like_post">Likes</option>
                                <option value="comment_post">Comments</option>
                                <option value="follow">Follows</option>
                                <option value="system">System</option>
                            </select>
                        </div>

                        {/* Read Filter */}
                        <div className="relative w-full sm:w-32 group">
                            <select
                                value={filterRead}
                                onChange={(e) => setFilterRead(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                            >
                                <option value="ALL">All Status</option>
                                <option value="READ">Read</option>
                                <option value="UNREAD">Unread</option>
                            </select>
                        </div>

                        {/* Rows Per Page */}
                        <div className="relative w-full sm:w-32">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Show</span>
                            </div>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors overflow-x-auto relative min-h-[400px]">
                {isPending && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[var(--site-accent)]" size={32} />
                    </div>
                )}

                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <button onClick={toggleSelectAll} className="flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                    {selectedIds.length === initialNotifications.length && initialNotifications.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">From â†’ To</th>
                            <th className="px-6 py-4">Context</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {initialNotifications.length > 0 ? (
                            initialNotifications.map((notification) => (
                                <tr key={notification.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(notification.id) ? "bg-[var(--site-accent)]/5" : ""} ${!notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelect(notification.id)} className={`flex items-center ${selectedIds.includes(notification.id) ? "text-[var(--site-accent)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"}`}>
                                            {selectedIds.includes(notification.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${NotificationTypeStyles[notification.type] || "bg-gray-100 text-gray-500"}`}>
                                            {notification.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* Sender */}
                                            <div className="flex items-center gap-1.5" title={`From: ${notification.sender.username}`}>
                                                {notification.sender.image ? (
                                                    <div className="w-6 h-6 rounded-full overflow-hidden relative border border-gray-200 dark:border-white/10">
                                                        <Image src={notification.sender.image} alt="S" fill className="object-cover" />
                                                    </div>
                                                ) : <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />}
                                                <span className="text-xs font-medium max-w-[80px] truncate">{notification.sender.username}</span>
                                            </div>
                                            <span className="text-gray-300 dark:text-gray-600">â†’</span>
                                            {/* Recipient */}
                                            <div className="flex items-center gap-1.5" title={`To: ${notification.recipient.username}`}>
                                                {notification.recipient.image ? (
                                                    <div className="w-6 h-6 rounded-full overflow-hidden relative border border-gray-200 dark:border-white/10">
                                                        <Image src={notification.recipient.image} alt="R" fill className="object-cover" />
                                                    </div>
                                                ) : <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />}
                                                <span className="text-xs font-medium max-w-[80px] truncate">{notification.recipient.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs text-xs text-gray-500">
                                        <div className="truncate">
                                            {notification.context ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="opacity-70">[{notification.context.type}]</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{notification.context.title || notification.context.text}</span>
                                                </span>
                                            ) : notification.details ? (
                                                <span className="italic opacity-70">
                                                    {typeof notification.details === 'string' ? notification.details : JSON.stringify(notification.details)}
                                                </span>
                                            ) : "-"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {formatDate(notification.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => { setSelectedIds([notification.id]); setIsDeleteModalOpen(true); }} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No notifications found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of <span className="font-bold text-gray-900 dark:text-white">{pagination.totalItems}</span> notifications
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1 || isPending}
                            className="px-3 py-1 pb-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let p = i + 1;
                                if (pagination.totalPages > 5) {
                                    if (pagination.currentPage > 3) p = pagination.currentPage - 2 + i;
                                    if (p > pagination.totalPages) p = pagination.totalPages - (4 - i);
                                }
                                if (p < 1 || p > pagination.totalPages) return null;

                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        disabled={isPending}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === pagination.currentPage
                                            ? "bg-[var(--site-accent)] text-white shadow-lg shadow-[var(--site-accent)]/30"
                                            : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0 || isPending}
                            className="px-3 py-1 pb-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); if (selectedIds.length === 1) setSelectedIds([]); }}
                onConfirm={handleDelete}
                isDeleting={isBulkProcessing}
                count={selectedIds.length}
                description={`Are you sure you want to delete ${selectedIds.length} notifications?`}
            />

            <AnimatePresence>
                {selectedIds.length > 0 && !isDeleteModalOpen && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                        <div className="bg-[#1A1A1A] border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                                <span className="text-white font-bold">{selectedIds.length}</span>
                                <span className="text-gray-400 text-sm">Selected</span>
                                <button onClick={() => setSelectedIds([])} className="bg-white/10 hover:bg-white/20 p-1 rounded-full transition-colors ml-2"><div className="w-3 h-3 flex items-center justify-center">x</div></button>
                            </div>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-full text-sm font-bold shadow-lg shadow-red-500/20 transition-colors">
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

