"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, FileText, Trash2, Archive, CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePost, bulkDeletePosts, bulkUpdatePostStatus, updatePost, createPost } from "@/lib/actions/post.actions";
import { getAllUsers } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Image as ImageIcon, Music, Video, User as UserIcon } from "lucide-react";
import { useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { getPageNumbers } from "@/lib/utils/getPageNumbers";

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

    // Create/Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<{
        id?: string,
        title?: string,
        text: string,
        authorId: string,
        image?: string,
        audio?: string,
        video?: string
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        };
        fetchUsers();
    }, []);

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
                const result = (await bulkDeletePosts(selectedIds, currentUserId)) as any;
                if (result.success) {
                    toast.success(`Deleted ${selectedIds.length} posts`);
                    setSelectedIds([]);
                    setActionType(null);
                    router.refresh();
                } else {
                    toast.error(result.error);
                }
            } else if (actionType === 'ARCHIVE' || actionType === 'ACTIVATE') {
                const result = (await bulkUpdatePostStatus(selectedIds, actionType, currentUserId)) as any;
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
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Posts</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setEditingPost({
                                    text: "",
                                    title: "",
                                    authorId: currentUserId || ""
                                });
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-[var(--site-button)] hover:opacity-90 text-[var(--site-button-text)] px-4 py-2 rounded-lg transition-all font-medium shadow-lg shadow-[var(--site-accent)]/20"
                        >
                            <Plus size={18} />
                            Create Post
                        </button>
                    </div>
                </div>

                {/* Filters Box */}
                <div className="bg-white/80 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">

                        {/* Search */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--site-secondary)] transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search posts or authors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-[var(--site-accent)]/40 dark:focus:border-[var(--site-secondary)]/50 transition-all duration-300"
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
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-accent)]/40 dark:focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-white dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
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
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-[var(--site-accent)]/40 dark:focus:border-[var(--site-secondary)]/50 appearance-none hover:bg-white dark:hover:bg-black/30 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/90 dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-slate-200/70 dark:border-white/5 rounded-2xl overflow-hidden shadow-md dark:shadow-xl transition-colors overflow-x-auto">
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
                                <tr key={post.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-white/5 group ${selectedIds.includes(post.id) ? 'bg-[var(--site-accent)]/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleSelectRow(post.id)}
                                            className="flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                        >
                                            {selectedIds.includes(post.id) ? (
                                                <CheckSquare size={18} className="text-[var(--site-accent)]" />
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
                                                    <img src={post.author.imageURL} alt="" onError={(e) => { e.currentTarget.src = "/placeholder.jpg" }} className="w-full h-full object-cover" />
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
                                        {formatDate(post.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                setEditingPost({
                                                    id: post.id,
                                                    title: post.title || "",
                                                    text: post.text,
                                                    authorId: post.authorId,
                                                    image: post.image,
                                                    audio: post.audio,
                                                    video: post.video
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="text-sm text-teal-400 hover:text-teal-300 mr-3"
                                        >
                                            Edit
                                        </button>
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
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <FileText size={24} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No posts found</p>
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
                        const result = (await deletePost(postToDelete, currentUserId)) as any;

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

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingPost?.id ? "Edit Post" : "Create New Post"}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Title Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Title (Optional)</label>
                                        <input
                                            type="text"
                                            value={editingPost?.title || ""}
                                            onChange={(e) => setEditingPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500/50"
                                            placeholder="Enter title..."
                                        />
                                    </div>

                                    {/* Author Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Author</label>
                                        <div className="relative">
                                            <select
                                                value={editingPost?.authorId || ""}
                                                onChange={(e) => setEditingPost(prev => prev ? { ...prev, authorId: e.target.value } : null)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500/50 appearance-none"
                                            >
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id} className="bg-[#1A1A1A]">
                                                        {u.name} (@{u.username})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                <UserIcon size={14} className="text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Post Content</label>
                                    <textarea
                                        value={editingPost?.text || ""}
                                        onChange={(e) => setEditingPost(prev => prev ? { ...prev, text: e.target.value } : null)}
                                        className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-teal-500/50 resize-none"
                                        placeholder="What's on your mind?"
                                    />
                                </div>

                                {/* Media Cluster */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                            <ImageIcon size={14} /> Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setEditingPost(prev => prev ? { ...prev, imageFile: file } as any : null);
                                            }}
                                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20"
                                        />
                                    </div>

                                    {/* Audio Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                            <Music size={14} /> Audio
                                        </label>
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setEditingPost(prev => prev ? { ...prev, audioFile: file } as any : null);
                                            }}
                                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                                        />
                                    </div>

                                    {/* Video Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                            <Video size={14} /> Video
                                        </label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setEditingPost(prev => prev ? { ...prev, videoFile: file } as any : null);
                                            }}
                                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!editingPost?.text.trim()) {
                                                toast.error("Post text cannot be empty");
                                                return;
                                            }
                                            if (!currentUserId) {
                                                toast.error("Unauthorized");
                                                return;
                                            }

                                            setIsSaving(true);
                                            const formData = new FormData();
                                            formData.append("title", editingPost.title || "");
                                            formData.append("text", editingPost.text);
                                            formData.append("authorId", editingPost.authorId);

                                            // @ts-ignore
                                            if (editingPost.imageFile) formData.append("image", editingPost.imageFile);
                                            // @ts-ignore
                                            if (editingPost.audioFile) formData.append("audio", editingPost.audioFile);
                                            // @ts-ignore
                                            if (editingPost.videoFile) formData.append("video", editingPost.videoFile);

                                            try {
                                                let result;
                                                if (editingPost.id) {
                                                    result = (await updatePost(editingPost.id, formData, currentUserId)) as any;
                                                } else {
                                                    result = (await createPost(currentUserId, formData, "/admin/posts")) as any;
                                                }

                                                if (result.success) {
                                                    toast.success(editingPost.id ? "Post updated" : "Post created");
                                                    setIsModalOpen(false);
                                                    router.refresh();
                                                } else {
                                                    toast.error(result.error || "Failed");
                                                }
                                            } catch (err) {
                                                toast.error("Action failed");
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                        disabled={isSaving}
                                        className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20"
                                    >
                                        {isSaving ? "Saving..." : editingPost?.id ? "Update Post" : "Create Post"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                        const res = (await bulkUpdatePostStatus(selectedIds, 'ARCHIVE', currentUserId)) as any;
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
                                        const res = (await bulkUpdatePostStatus(selectedIds, 'ACTIVATE', currentUserId)) as any;
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

