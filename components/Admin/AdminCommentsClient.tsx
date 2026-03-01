"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, Trash2, CheckSquare, Square, ExternalLink, MoreHorizontal, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteComment, bulkDeleteComments } from "@/lib/actions/comment.actions";
import Link from "next/link";
import Image from "next/image";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import { getPageNumbers } from "@/lib/utils/getPageNumbers";

interface Comment {
    id: string;
    text: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        imageURL: string | null;
    };
    targetType: 'POST' | 'PROJECT';
    targetId: string | null;
    post?: { id: string; title: string | null; text: string };
    project?: { id: string; title: string };
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export default function AdminCommentsClient({
    initialComments,
    pagination
}: {
    initialComments: Comment[],
    pagination: PaginationProps
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Local state for inputs
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [filterTarget, setFilterTarget] = useState(searchParams.get('target') || "ALL");
    const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get('limit') || "10"));

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewComment, setViewComment] = useState<Comment | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Sync URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        } else {
            params.delete('search');
        }

        if (filterTarget !== "ALL") {
            params.set('target', filterTarget);
        } else {
            params.delete('target');
        }

        if (rowsPerPage !== 10) {
            params.set('limit', rowsPerPage.toString());
        } else {
            params.delete('limit');
        }

        // Reset to page 1 on filter change
        params.set('page', '1');

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [debouncedSearch, filterTarget, rowsPerPage, pathname, router]);

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
            setSelectedIds(initialComments.map(c => c.id));
        }
    };

    const handleDelete = async () => {
        setIsBulkProcessing(true);
        const result = (await bulkDeleteComments(selectedIds)) as any;
        if (result.success) {
            toast.success(`Deleted ${selectedIds.length} comments`);
            setSelectedIds([]);
            setIsDeleteModalOpen(false);
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setIsBulkProcessing(false);
    };

    return (
        <div className="relative">
            {/* Toolbar */}
            <div className="bg-white/80 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors mb-6">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full lg:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--site-secondary)] transition-colors" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search comments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-[var(--site-accent)]/40 dark:focus:border-[var(--site-secondary)]/50 transition-all duration-300"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        {/* Target Filter */}
                        <div className="relative w-full sm:w-48 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="text-gray-400 dark:text-gray-500" size={16} />
                            </div>
                            <select
                                value={filterTarget}
                                onChange={(e) => setFilterTarget(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-accent)]/40 dark:focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-white dark:hover:bg-black/30 transition-all"
                            >
                                <option value="ALL">All Targets</option>
                                <option value="POST">Posts</option>
                                <option value="PROJECT">Projects</option>
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
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-accent)]/40 dark:focus:border-teal-500/50 appearance-none cursor-pointer hover:bg-white dark:hover:bg-black/30 transition-all"
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
            <div className="bg-white/90 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-md dark:shadow-xl transition-colors overflow-x-auto relative min-h-[400px]">
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
                                    {selectedIds.length === initialComments.length && initialComments.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="px-6 py-4">Content</th>
                            <th className="px-6 py-4">Author</th>
                            <th className="px-6 py-4">Target</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {initialComments.length > 0 ? (
                            initialComments.map((comment) => (
                                <tr key={comment.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(comment.id) ? "bg-[var(--site-accent)]/5" : ""}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelect(comment.id)} className={`flex items-center ${selectedIds.includes(comment.id) ? "text-[var(--site-accent)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"}`}>
                                            {selectedIds.includes(comment.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="truncate font-medium text-gray-900 dark:text-gray-100" title={comment.text}>
                                            {comment.text}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {comment.user.image || comment.user.imageURL ? (
                                                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                    <img src={comment.user.imageURL || comment.user.image || ""} alt={comment.user.name || "User"} onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    {comment.user.name || "Unknown"}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    @{comment.user.username || "user"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${comment.targetType === 'POST' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'}`}>
                                                {comment.targetType}
                                            </span>
                                            {comment.targetId && (
                                                <Link href={comment.targetType === 'POST' ? `/feed` : `/projects/${comment.project?.id}`} target="_blank" className="text-gray-400 hover:text-[var(--site-secondary)] transition-colors">
                                                    <ExternalLink size={14} />
                                                </Link>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate max-w-[150px] mt-1">
                                            {comment.targetType === 'POST' ? comment.post?.title || comment.post?.text : comment.project?.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {formatDate(comment.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setViewComment(comment)} className="p-2 rounded-lg text-gray-400 hover:text-[var(--site-secondary)] hover:bg-[var(--site-accent)]/10 transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => { setSelectedIds([comment.id]); setIsDeleteModalOpen(true); }} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No comments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of <span className="font-bold text-gray-900 dark:text-white">{pagination.totalItems}</span> comments
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
                            {getPageNumbers(pagination.currentPage, pagination.totalPages).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    disabled={isPending}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === pagination.currentPage
                                        ? "bg-[var(--site-button)] text-[var(--site-button-text)] shadow-lg shadow-[var(--site-accent)]/20"
                                        : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
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

            {/* View Comment Modal */}
            <AnimatePresence>
                {viewComment && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewComment(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    Comment Details
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${viewComment.targetType === 'POST' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'}`}>
                                        {viewComment.targetType}
                                    </span>
                                </h3>

                                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                    {viewComment.user.image || viewComment.user.imageURL ? (
                                        <img src={viewComment.user.imageURL || viewComment.user.image || ""} alt="" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    )}
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{viewComment.user.name || "Unknown"}</div>
                                        <div className="text-sm text-gray-500">@{viewComment.user.username} â€¢ {formatDate(viewComment.createdAt)}</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-black/30 p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-6 max-h-[300px] overflow-y-auto">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {viewComment.text}
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setViewComment(null)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                        Close
                                    </button>
                                    <Link
                                        href={viewComment.targetType === 'POST' ? `/feed` : `/projects/${viewComment.project?.id}`}
                                        target="_blank"
                                        className="px-4 py-2 rounded-xl bg-[var(--site-accent)] text-white text-sm font-bold shadow-lg shadow-[var(--site-accent)]/20 hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        View Content <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); if (selectedIds.length === 1) setSelectedIds([]); }}
                onConfirm={handleDelete}
                isDeleting={isBulkProcessing}
                count={selectedIds.length}
                description={`Are you sure you want to delete ${selectedIds.length} comments?`}
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

