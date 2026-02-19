"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Layers, Plus, Pencil, Trash2, Search, X, Check, Loader2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/category.actions";
import { AnimatePresence, motion } from "framer-motion";

interface Category {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    _count: { projects: number };
}

export default function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
    const router = useRouter();
    const [categories, setCategories] = useState(initialCategories);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredCategories = categories.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleOpenModal = (category: Category | null = null) => {
        setEditingCategory(category);
        setFormData({
            title: category?.title || "",
            description: category?.description || ""
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ title: "", description: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error("Title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                const res = (await updateCategory(editingCategory.id, formData)) as any;
                if (res.success && res.data) {
                    toast.success("Category updated");
                    // Update local state immediately
                    setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...res.data } as Category : c));
                    handleCloseModal();
                    router.refresh();
                } else {
                    toast.error(res.error || "Failed to update category");
                }
            } else {
                const res = (await createCategory(formData)) as any;
                if (res.success && res.data) {
                    toast.success("Category created");
                    // Update local state immediately (with initial count 0)
                    const newCategory = { ...res.data, _count: { projects: 0 } } as Category;
                    setCategories(prev => [newCategory, ...prev]);
                    handleCloseModal();
                    router.refresh();
                } else {
                    toast.error(res.error || "Failed to create category");
                }
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, count: number) => {
        if (count > 0) {
            toast.error(`Cannot delete category with ${count} projects. Reassign them first.`);
            return;
        }

        if (!confirm("Are you sure you want to delete this category?")) return;

        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
            const res = (await deleteCategory(id)) as any;
            if (res.success) {
                toast.success("Category deleted");
                // Local state is already being filtered in the previous code, 
                // but let's be explicit and make sure it stays in sync.
                setCategories(prev => prev.filter(c => c.id !== id));
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="relative">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500">
                            <Layers size={24} />
                        </div>
                        <h1 className="text-3xl font-bold">Categories</h1>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-teal-500/20"
                    >
                        <Plus size={18} />
                        New Category
                    </button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 dark:text-gray-500" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1A1A1A]/60 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-gray-200 focus:outline-none focus:border-teal-500/50 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map(category => (
                    <div key={category.id} className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-teal-500 transition-colors">{category.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{category.slug}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(category)}
                                    className="p-2 rounded-lg text-gray-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id, category._count.projects)}
                                    disabled={loadingMap[category.id] || category._count.projects > 0}
                                    className={`p-2 rounded-lg transition-colors ${category._count.projects > 0
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        }`}
                                >
                                    {loadingMap[category.id] ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 h-10">
                            {category.description || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between text-xs font-medium pt-4 border-t border-gray-100 dark:border-white/5">
                            <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                {category._count.projects} Projects
                            </span>
                            {/* Potential status indicator or date here */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="absolute inset-0" onClick={handleCloseModal} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <h2 className="text-xl font-bold">{editingCategory ? "Edit Category" : "New Category"}</h2>
                                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        autoFocus
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-teal-500 transition-colors"
                                        placeholder="e.g. Web Development"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-teal-500 transition-colors h-24 resize-none"
                                        placeholder="Brief description of this category..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        {editingCategory ? "Update" : "Create"}
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
