"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Upload, User as UserIcon, Link as LinkIcon, FileText, Image as ImageIcon, Video, Tag, Folder, Star, X } from "lucide-react";
import { createProject, updateProject, getCategories, getAuthors } from "@/lib/actions/project.actions";

interface ProjectFormProps {
    initialData?: any;
    isNew?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ProjectForm({ initialData, isNew = false, onSuccess, onCancel }: ProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [authors, setAuthors] = useState<{ id: string, name: string | null }[]>([]);

    useEffect(() => {
        getAuthors().then(res => {
            if (res.success && res.data) {
                setAuthors(res.data);
            }
        });
    }, []);

    const [formData, setFormData] = useState<{
        title: string;
        slug: string;
        description: string;
        content: string;
        type: "IMAGE" | "VIDEO";
        image: string;
        videoFile: string;
        demoUrl: string;
        repoUrl: string;
        tags: string;
        categoryId: string;
        authorId: string; // New field
        favorite: boolean;
        status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
        gallery: { type: 'image' | 'video'; url: string }[];
    }>({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        content: initialData?.content || "",
        type: initialData?.type || "IMAGE",
        image: initialData?.image || "",
        videoFile: initialData?.videoFile || "",
        demoUrl: initialData?.demoUrl || "",
        repoUrl: initialData?.repoUrl || "",
        tags: initialData?.tags || "",
        categoryId: initialData?.categoryId || "",
        authorId: initialData?.authorId || "",
        favorite: initialData?.favorite || false,
        status: initialData?.status || "PUBLISHED",
        gallery: initialData?.gallery || [],
    });

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    const [categories, setCategories] = useState<{ id: string, title: string }[]>([]);

    useEffect(() => {
        getCategories().then(res => {
            if (res.success && res.data) {
                setCategories(res.data);
            }
        });
    }, []);

    useEffect(() => {
        // Generate slug from title if new
        if (isNew && formData.title && !initialData) {
            setFormData(prev => ({
                ...prev,
                slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }));
            // Don't mark as dirty just for auto-slug
        }
    }, [formData.title, isNew, initialData]);

    const handleSave = async (forceStatus?: "DRAFT") => {
        if (!forceStatus && (!formData.title || !formData.slug)) {
            toast.error("Title and Slug are required");
            return;
        }

        setLoading(true);
        try {
            const dataToSave = { ...formData };
            if (forceStatus) {
                dataToSave.status = forceStatus;
            }

            const result = isNew
                ? await createProject(dataToSave)
                : await updateProject(initialData.id, dataToSave);

            if (result.success) {
                if (forceStatus === "DRAFT") {
                    toast.success("Changes saved to Draft");
                } else {
                    toast.success(`Project ${isNew ? 'created' : 'updated'} successfully`);
                }

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/admin/projects");
                    router.refresh();
                }
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAttempt = async () => {
        if (isDirty && !loading) {
            // Auto-save as draft
            await handleSave("DRAFT");
        } else if (onCancel) {
            onCancel();
        }
    };

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        const form = new FormData();
        form.append("file", file);
        form.append("type", type);

        const uploadPromise = fetch("/api/sanity/upload", {
            method: "POST",
            body: form,
        }).then(async (res) => {
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Upload failed");
            }
            return res.json();
        });

        toast.promise(uploadPromise, {
            loading: `Uploading ${type === "image" ? "Image" : "Video"}...`,
            success: (res: any) => {
                if (res.success && res.url) {
                    if (type === "image") {
                        updateFormData({ image: res.url });
                    } else {
                        updateFormData({ videoFile: res.url });
                    }
                    return "Uploaded to Sanity!";
                }
                throw new Error(res.error || "Failed");
            },
            error: (err) => err.message || "Upload failed"
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop Click Capture */}
            <div className="absolute inset-0" onClick={handleCloseAttempt} />

            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-y-auto animate-in zoom-in-50 duration-200 scrollbar-hide relative z-10 flex flex-col">

                {/* Header - Sticky */}
                <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-lg border-b border-gray-100 dark:border-white/5 px-8 py-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {isNew ? 'Create Project' : 'Edit Project'}
                            {isDirty && <span className="ml-2 text-xs font-normal text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Unsaved Changes</span>}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {isNew ? 'Add a new project to your portfolio.' : 'Update project details and assets.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => updateFormData({ favorite: !formData.favorite })}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${formData.favorite
                                ? "bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-500"
                                : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            <Star size={16} className={formData.favorite ? "fill-current" : ""} />
                            <span className="text-xs font-medium">{formData.favorite ? "Favorited" : "Favorite"}</span>
                        </button>
                        <button
                            onClick={handleCloseAttempt}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 flex-1">
                    {/* Main Info */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-[var(--site-secondary)] transition-colors">Project Title</label>
                                <input
                                    value={formData.title}
                                    onChange={e => updateFormData({ title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-[var(--site-secondary)] focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400"
                                    placeholder="e.g. Modern E-commerce Platform"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-teal-500 transition-colors">Slug (URL)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <LinkIcon size={16} />
                                    </div>
                                    <input
                                        value={formData.slug}
                                        onChange={e => updateFormData({ slug: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-[var(--site-secondary)] focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-[var(--site-accent)] font-mono text-sm transition-all duration-300 placeholder-gray-400"
                                        placeholder="project-slug"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => updateFormData({ type: "IMAGE" })}
                                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${formData.type === "IMAGE" ? "bg-[var(--site-button)] text-[var(--site-button-text)] border-[var(--site-accent)] shadow-lg shadow-[var(--site-accent)]/20" : "bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                                >
                                    <ImageIcon size={18} /> <span className="font-medium">Image Based</span>
                                </button>
                                <button
                                    onClick={() => updateFormData({ type: "VIDEO" })}
                                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${formData.type === "VIDEO" ? "bg-[var(--site-button)] text-[var(--site-button-text)] border-[var(--site-accent)] shadow-lg shadow-[var(--site-accent)]/20" : "bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                                >
                                    <Video size={18} /> <span className="font-medium">Video Based</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Project Status</label>
                            <div className="relative">
                                <select
                                    value={formData.status}
                                    onChange={e => updateFormData({ status: e.target.value as "PUBLISHED" | "DRAFT" | "ARCHIVED" })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-[var(--site-secondary)] focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white appearance-none transition-all duration-300 cursor-pointer"
                                >
                                    <option value="PUBLISHED">Published</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-purple-500 transition-colors">Category</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Folder size={16} />
                                </div>
                                <select
                                    value={formData.categoryId}
                                    onChange={e => updateFormData({ categoryId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white appearance-none transition-all duration-300 cursor-pointer"
                                    title="Project Category"
                                >
                                    <option value="">No Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Author Selection (Admin) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-teal-500 transition-colors">Author (Admin Select)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <UserIcon size={16} />
                                </div>
                                <select
                                    value={formData.authorId}
                                    onChange={e => updateFormData({ authorId: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-[var(--site-secondary)] focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white appearance-none transition-all duration-300 cursor-pointer"
                                    title="Project Author"
                                >
                                    <option value="">Current User</option>
                                    {authors.map(author => (
                                        <option key={author.id} value={author.id}>{author.name || "Unknown User"}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div className="md:col-span-2 group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-teal-500 transition-colors">Tags</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Tag size={16} />
                                </div>
                                <input
                                    value={formData.tags}
                                    onChange={e => updateFormData({ tags: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-[var(--site-secondary)] focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400"
                                    placeholder="Comma separated tags (e.g. React, Design, UI/UX)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cover Media</label>
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-black/40 border-2 border-dashed border-gray-200 dark:border-white/10 group hover:border-teal-500 dark:hover:border-teal-500/50 transition-all duration-300">
                                {formData.image ? (
                                    <>
                                        <Image src={formData.image} alt="Cover" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2"><Upload size={18} /> Change Image</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3 group-hover:text-teal-500 transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-500/10 transition-colors">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-sm font-medium">Click to upload cover image</p>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleAssetUpload(e, "image")} />
                            </div>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-purple-500 transition-colors">External Link (ArtStation / Behance)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <LinkIcon size={16} />
                                </div>
                                <input
                                    value={formData.repoUrl}
                                    onChange={e => updateFormData({ repoUrl: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400"
                                    placeholder="https://artstation.com/artwork/..."
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-blue-500 transition-colors">Download / High-Res Link</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Upload size={16} />
                                </div>
                                <input
                                    value={formData.demoUrl}
                                    onChange={e => updateFormData({ demoUrl: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400"
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>
                        </div>

                        {formData.type === "VIDEO" && (
                            <div className="group md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-red-500 transition-colors">Video Source URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Video size={16} />
                                    </div>
                                    <input
                                        value={formData.videoFile}
                                        onChange={e => updateFormData({ videoFile: e.target.value })}
                                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-red-500 focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400"
                                        placeholder="https://... OR Upload Video"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <label className="p-2 cursor-pointer text-gray-400 hover:text-red-500 transition-colors" title="Upload Video to Sanity">
                                            <Upload size={18} />
                                            <input
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => handleAssetUpload(e, "file")}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gallery Section */}
                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Project Gallery</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Upload Button */}
                                <label className="aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-teal-500 dark:hover:border-teal-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-gray-50 dark:bg-black/20">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-500/10 transition-colors mb-2">
                                        <Upload size={20} className="text-gray-400 dark:text-gray-500 group-hover:text-teal-500" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-teal-500">Add Media</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                Array.from(e.target.files).forEach(file => {
                                                    const type = file.type.startsWith('image/') ? 'image' : 'file';
                                                    const form = new FormData();
                                                    form.append("file", file);
                                                    form.append("type", type);

                                                    const uploadPromise = fetch("/api/sanity/upload", {
                                                        method: "POST",
                                                        body: form,
                                                    }).then(async (res) => {
                                                        if (!res.ok) {
                                                            const error = await res.json();
                                                            throw new Error(error.error || "Upload failed");
                                                        }
                                                        return res.json();
                                                    });

                                                    toast.promise(uploadPromise, {
                                                        loading: "Uploading gallery item...",
                                                        success: (res: any) => {
                                                            if (res.success && res.url) {
                                                                setFormData(prev => {
                                                                    const newGalleryItem: { type: 'image' | 'video'; url: string } = {
                                                                        type: type === 'image' ? 'image' : 'video',
                                                                        url: res.url
                                                                    };
                                                                    const newState = {
                                                                        ...prev,
                                                                        gallery: [...(prev.gallery || []), newGalleryItem]
                                                                    };
                                                                    setIsDirty(true);
                                                                    return newState;
                                                                });
                                                                return "Added to gallery";
                                                            }
                                                            throw new Error(res.error);
                                                        },
                                                        error: (err) => err.message || "Upload failed"
                                                    });
                                                });
                                            }
                                        }}
                                    />
                                </label>

                                {/* Gallery Items */}
                                {formData.gallery && formData.gallery.map((item, index) => (
                                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-200 dark:border-white/10 bg-black">
                                        {item.type === 'video' ? (
                                            <video src={item.url} className="w-full h-full object-cover opacity-80" />
                                        ) : (
                                            <Image src={item.url} alt={`Gallery ${index}`} fill className="object-cover" />
                                        )}

                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const newGallery = [...formData.gallery];
                                                    newGallery.splice(index, 1);
                                                    updateFormData({ gallery: newGallery });
                                                }}
                                                className="p-2 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors border border-red-500/50"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        {item.type === 'video' && (
                                            <div className="absolute top-2 right-2 pointer-events-none">
                                                <Video size={14} className="text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-teal-500 transition-colors">Short Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => updateFormData({ description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-teal-500 focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-400 resize-none h-24"
                                placeholder="A brief summary of the project..."
                            />
                        </div>
                        <div className="group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-focus-within:text-teal-500 transition-colors">Detailed Content</label>
                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">Markdown Supported</span>
                            </div>
                            <textarea
                                value={formData.content}
                                onChange={e => updateFormData({ content: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-teal-500 focus:bg-white dark:focus:bg-black/40 outline-none text-gray-900 dark:text-gray-200 font-mono text-sm transition-all duration-300 placeholder-gray-400 resize-y h-80"
                                placeholder="# Project Details&#10;&#10;Describe your project features, tech stack, and challenges..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer - Sticky */}
                <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 px-8 py-5 flex justify-end gap-3 sticky bottom-0 z-20">
                    <button
                        onClick={handleCloseAttempt}
                        className="px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors"
                    >
                        {isDirty ? "Save as Draft & Close" : "Cancel"}
                    </button>
                    <button
                        onClick={() => handleSave()}
                        disabled={loading}
                        className={`px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--site-accent-prev)] to-[var(--site-accent-next)] text-[var(--site-button-text)] font-bold shadow-lg shadow-[var(--site-accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        <Save size={18} /> {loading ? "Saving..." : "Publish Project"}
                    </button>
                </div>
            </div>
        </div>
    );
}

