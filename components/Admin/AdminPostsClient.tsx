"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, FileText, Trash2, Archive, CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePost, bulkDeletePosts, bulkUpdatePostStatus } from "@/lib/actions/post.actions";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminPostsClient({ posts, currentUserId }: { posts: any[], currentUserId?: string }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Delete State
    // Delete State
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Bulk Action State
    const [actionType, setActionType] = useState<'DELETE' | 'ARCHIVE' | 'ACTIVATE' | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Sort Config
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, ACTIVE, ARCHIVED

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
    const filteredAndSortedPosts = useMemo(() => {
        let result = [...posts];

        // 1. Search (Text or Author Name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(post =>
                post.text?.toLowerCase().includes(query) ||
                post.author?.name?.toLowerCase().includes(query) ||
                post.author?.username?.toLowerCase().includes(query)
            );
        }

        // 2. Status Filter
        if (filterStatus !== "ALL") {
            const isArchived = filterStatus === "ARCHIVED";
            result = result.filter(post => post.isArchived === isArchived);
        }

        // 3. Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'author') {
                    aValue = (a.author?.name || '').toLowerCase();
                    bValue = (b.author?.name || '').toLowerCase();
                } else if (sortConfig.key === 'createdAt') {
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
    }, [posts, sortConfig, searchQuery, filterStatus]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedPosts.length / rowsPerPage);
    const paginatedPosts = filteredAndSortedPosts.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Reset Page on Filter Change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, rowsPerPage]);

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
        if (selectedIds.length === paginatedPosts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedPosts.map(p => p.id));
        }
    };

    const handleSelectRow = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const performBulkAction = async () => {
        if (!currentUserId) {
            toast.error("Unauthorized: Check login session");
            return;
        }

        setIsBulkProcessing(true);
        try {
            if (actionType === 'DELETE') {
                const result = await bulkDeletePosts(selectedIds, currentUserId);
                if (result.success) {
                    toast.success(`Deleted ${selectedIds.length} posts`);
                    setSelectedIds([]);
                    setActionType(null);
                    router.refresh();
                } else {
                    toast.error(result.error);
                }
            } else if (actionType === 'ARCHIVE' || actionType === 'ACTIVATE') {
                const result = await bulkUpdatePostStatus(selectedIds, actionType, currentUserId);
                if (result.success) {
                    toast.success(`Updated ${selectedIds.length} posts`);
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
                                placeholder="Search posts or authors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-teal-500/50 transition-all"
                            />
                        </div>

                        {/* Controls Group */}
                        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">

                            {/* Status Filter */}
                            <div className="relative w-full sm:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <AlertCircle className="text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors" size={16} />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ArrowUpDown size={14} className="text-gray-400 dark:text-gray-600" />
                                </div>
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
                                    {paginatedPosts.length > 0 && selectedIds.length === paginatedPosts.length ? (
                                        <CheckSquare size={18} className="text-teal-400" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                </button>
                            </th>
                            <SortHeader label="Post" columnKey="text" />
                            <SortHeader label="Author" columnKey="author" />
                            <SortHeader label="Status" columnKey="isArchived" />
                            <SortHeader label="Date" columnKey="createdAt" />
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {paginatedPosts.length > 0 ? (
                            paginatedPosts.map((post: any) => (
                                <tr key={post.id} className={`transition-colors ${selectedIds.includes(post.id) ? 'bg-teal-500/10 hover:bg-teal-500/20' : 'hover:bg-[var(--glass-border)]'}`}>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleSelectRow(post.id)}
                                            className="flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                        >
                                            {selectedIds.includes(post.id) ? (
                                                <CheckSquare size={18} className="text-teal-500" />
                                            ) : (
                                                <Square size={18} />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700/50 relative flex-shrink-0">
                                            {post.image ? (
                                                <Image
                                                    src={post.image}
                                                    alt="Post Image"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                                            )}
                                        </div>
                                        <div className="max-w-md">
                                            <p className="text-sm text-gray-900 dark:text-[var(--glass-text-muted)] line-clamp-2">{post.text}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            {post.author.imageURL && (
                                                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                    <Image src={post.author.imageURL} alt="" fill className="object-cover" />
                                                </div>
                                            )}
                                            {post.author.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${post.isArchived ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {post.isArchived ? 'Archived' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-sm text-teal-400 hover:text-teal-300 mr-3">Edit</button>
                                        <Link href={`/post/${post.id}`} className="text-sm text-blue-400 hover:text-blue-300 mr-3">View</Link>

                                        {post.isArchived && (
                                            <button
                                                onClick={() => setPostToDelete(post.id)}
                                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                                title="Delete Post"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-[var(--glass-text-muted)]">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-[var(--glass-border)] flex items-center justify-center mb-2">
                                            <FileText size={24} opacity={0.5} />
                                        </div>
                                        <p className="font-medium">No posts found</p>
                                        <p className="text-xs">Try adjusting your search or filters</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedPosts.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedPosts.length}</span> posts
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
                                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
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
                isOpen={!!postToDelete || (actionType === 'DELETE' && selectedIds.length > 0)}
                onClose={() => { setPostToDelete(null); setActionType(null); }}
                onConfirm={async () => {
                    // Check if Single Delete or Bulk Delete
                    if (actionType === 'DELETE' && selectedIds.length > 0) {
                        await performBulkAction();
                        return;
                    }

                    if (!postToDelete || !currentUserId) {
                        if (!currentUserId) toast.error("Unauthorized: No user ID");
                        return;
                    }

                    setIsDeleting(true);

                    try {
                        const result = await deletePost(postToDelete, currentUserId);

                        if (result?.success) {
                            toast.success("Post deleted successfully");
                            setPostToDelete(null);
                            router.refresh();
                        } else {
                            toast.error(result?.error || "Failed to delete post");
                        }
                    } catch (error) {
                        toast.error("An error occurred");
                        console.error(error);
                    } finally {
                        setIsDeleting(false);
                    }
                }}
                isDeleting={isDeleting || isBulkProcessing}
                count={actionType === 'DELETE' ? selectedIds.length : 1}
                description={actionType === 'DELETE' ? `Are you sure you want to delete ${selectedIds.length} selected posts? This action cannot be undone.` : undefined} // Use dynamic default
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
                                {/* Real Buttons */}
                                <button
                                    onClick={async () => {
                                        if (!currentUserId) { toast.error("Unauthorized: No user ID"); return; }
                                        setIsBulkProcessing(true);
                                        const res = await bulkUpdatePostStatus(selectedIds, 'ARCHIVE', currentUserId);
                                        if (res.success) { toast.success(`Archived ${selectedIds.length} posts`); setSelectedIds([]); router.refresh(); }
                                        else { toast.error(res.error || "Failed to archive posts"); }
                                        setIsBulkProcessing(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-full text-sm font-medium transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <Archive size={16} />
                                    Archive
                                </button>

                                <button
                                    onClick={async () => {
                                        if (!currentUserId) { toast.error("Unauthorized: No user ID"); return; }
                                        setIsBulkProcessing(true);
                                        const res = await bulkUpdatePostStatus(selectedIds, 'ACTIVATE', currentUserId);
                                        if (res.success) { toast.success(`Activated ${selectedIds.length} posts`); setSelectedIds([]); router.refresh(); }
                                        else { toast.error(res.error || "Failed to activate posts"); }
                                        setIsBulkProcessing(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-full text-sm font-medium transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <CheckCircle size={16} />
                                    Activate
                                </button>

                                <div className="w-px h-4 bg-white/10 mx-2" />

                                <button
                                    onClick={() => setActionType('DELETE')}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-full text-sm font-bold shadow-lg shadow-red-500/20 transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
