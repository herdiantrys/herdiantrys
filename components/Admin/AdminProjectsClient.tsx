"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Archive, CheckSquare, Square, Search, Filter, Folder, ArrowUpDown, ArrowUp, ArrowDown, Pencil, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { bulkDeleteProjects, bulkUpdateProjectStatus } from "@/lib/actions/project.actions";
import ProjectForm from "./ProjectForm";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface Project {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    category: { title: string } | null;
    type: string;
    status: string;
    views: number;
    favorite: boolean;
    isArchived: boolean;
    createdAt: Date;
}

export default function AdminProjectsClient({ initialProjects }: { initialProjects: any[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    // Feature State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Bulk Action State
    const [actionType, setActionType] = useState<'DELETE' | 'ARCHIVE' | 'PUBLISH' | null>(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Filter out archived projects from main view if desired, or show status. 
    // Assuming we show all but indicate status or filter elsewhere. 
    // For now, let's show all.

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
            // Select from current VIEW
            setSelectedIds(paginatedProjects.map(p => p.id));
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedProjects = useMemo(() => {
        let result = [...initialProjects];

        // 1. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.slug.toLowerCase().includes(query)
            );
        }

        // 2. Filter Category
        if (filterCategory !== "ALL") {
            result = result.filter(p => p.category?.title === filterCategory);
        }

        // 3. Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested or specific fields
                if (sortConfig.key === 'category') {
                    aValue = a.category?.title || '';
                    bValue = b.category?.title || '';
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
    }, [initialProjects, searchQuery, filterCategory, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProjects.length / rowsPerPage);
    const paginatedProjects = filteredAndSortedProjects.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useMemo(() => setCurrentPage(1), [searchQuery, filterCategory, rowsPerPage]);

    // Unique Categories for Filter
    const categories = useMemo(() => {
        const cats = new Set(initialProjects.map(p => p.category?.title).filter(Boolean));
        return Array.from(cats);
    }, [initialProjects]);

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[var(--site-accent)]" /> : <ArrowDown size={14} className="text-[var(--site-accent)]" />;
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
                const result = await bulkDeleteProjects(selectedIds);
                if (result.success) {
                    toast.success(`Deleted ${selectedIds.length} projects`);
                    setSelectedIds([]);
                    setActionType(null);
                    router.refresh();
                } else {
                    toast.error(result.error);
                }
            } else if (actionType === 'ARCHIVE' || actionType === 'PUBLISH') {
                const status = actionType === 'ARCHIVE' ? 'ARCHIVED' : 'PUBLISHED';
                const result = await bulkUpdateProjectStatus(selectedIds, status);
                if (result.success) {
                    toast.success(`Set ${selectedIds.length} projects to ${status}`);
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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleCreate = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleFormSuccess = () => {
        handleModalClose();
        router.refresh();
    };

    return (
        <div className="relative">
            {/* Modal Overlay is now handled inside ProjectForm */}
            {isModalOpen && (
                <ProjectForm
                    isNew={!editingProject}
                    initialData={editingProject}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            )}

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <div className="flex gap-3">
                        {/* Bulk actions removed from here */}
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-[var(--site-button)] hover:opacity-90 text-[var(--site-button-text)] px-4 py-2 rounded-lg transition-all font-medium shadow-lg shadow-[var(--site-accent)]/20"
                        >
                            <Plus size={18} />
                            New Project
                        </button>
                    </div>
                </div>

                {/* Filters Box */}
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-5 rounded-2xl shadow-sm dark:shadow-xl transition-colors">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                        {/* Search Input */}
                        <div className="relative w-full lg:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-[var(--site-accent)] transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:border-[var(--site-accent)]/50 transition-all duration-300"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                            {/* Category Filter */}
                            <div className="relative w-full sm:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Folder className="text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" size={16} />
                                </div>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                                >
                                    <option value="ALL">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
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
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:border-teal-500/50 appearance-none hover:bg-gray-100 dark:hover:bg-black/30 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <button onClick={toggleSelectAll} className="flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                                    {selectedIds.length === paginatedProjects.length && paginatedProjects.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <SortHeader label="Project" columnKey="title" />
                            <SortHeader label="Category" columnKey="category" />
                            <th className="px-6 py-4">Author</th>
                            <SortHeader label="Type" columnKey="type" />
                            <SortHeader label="Status" columnKey="status" />
                            <SortHeader label="Views" columnKey="views" />
                            <SortHeader label="Date" columnKey="createdAt" />
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {paginatedProjects.length > 0 ? (
                            paginatedProjects.map((project) => (
                                <tr key={project.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${selectedIds.includes(project.id) ? "bg-[var(--site-accent)]/5" : ""}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelect(project.id)} className={`flex items-center ${selectedIds.includes(project.id) ? "text-[var(--site-accent)]" : "text-gray-400 hover:text-gray-600 dark:hover:text-white"}`}>
                                            {selectedIds.includes(project.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700/50 relative flex-shrink-0 border border-gray-200 dark:border-white/5">
                                            {project.image ? (
                                                <Image
                                                    src={project.image}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px] group-hover:text-[var(--site-accent)] transition-colors">{project.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{project.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {project.category?.title || "Uncategorized"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {project.author?.image && (
                                                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                                                    <Image src={project.author.image} alt={project.author.name} fill className="object-cover" />
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {project.author?.name || "Unknown"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${project.type === 'VIDEO' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                                                {project.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${project.status === 'PUBLISHED' ? 'bg-[var(--site-accent)]/10 text-[var(--site-accent)]' :
                                            project.status === 'ARCHIVED' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500' :
                                                'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {project.status || (project.isArchived ? "ARCHIVED" : "PUBLISHED")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="text-gray-500 dark:text-gray-400">Views: {project.views}</div>
                                        {project.favorite && <div className="text-amber-500 font-medium">★ Favorite</div>}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {formatDate(project.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleEdit(project)} className="p-2 rounded-lg text-[var(--site-accent)] hover:bg-[var(--site-accent)]/10 transition-colors" title="Edit Project">
                                            <Pencil size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2">
                                            <Search size={24} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No projects found</p>
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
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * rowsPerPage, filteredAndSortedProjects.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedProjects.length}</span> projects
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
                description={`Are you sure you want to delete ${selectedIds.length} selected projects? This action cannot be undone.`}
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
                                    onClick={async () => {
                                        setIsBulkProcessing(true);
                                        const res = await bulkUpdateProjectStatus(selectedIds, 'ARCHIVED');
                                        if (res.success) { toast.success(`Archived ${selectedIds.length} projects`); setSelectedIds([]); router.refresh(); }
                                        else { toast.error(res.error); }
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
                                        setIsBulkProcessing(true);
                                        const res = await bulkUpdateProjectStatus(selectedIds, 'PUBLISHED');
                                        if (res.success) { toast.success(`Published ${selectedIds.length} projects`); setSelectedIds([]); router.refresh(); }
                                        else { toast.error(res.error); }
                                        setIsBulkProcessing(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-full text-sm font-medium transition-colors"
                                    disabled={isBulkProcessing}
                                >
                                    <CheckCircle size={16} />
                                    Publish
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
        </div >
    );
}
