"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Link as LinkIcon, FileText, Tag, DollarSign, Globe, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { createDigitalProduct, updateDigitalProduct, uploadDigitalProductThumbnail } from "@/lib/actions/digital-product.actions";
import { toast } from "sonner";
import Image from "next/image";

interface AdminProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function AdminDigitalProductForm({ initialData, isEdit = false }: AdminProductFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        priceIdr: initialData?.priceIdr?.toString() || "0",
        priceRunes: initialData?.priceRunes?.toString() || "0",
        currency: initialData?.currency || "IDR",
        category: initialData?.category || "EBOOK",
        type: initialData?.type || "OTHER",
        coverImage: initialData?.coverImage || "",
        thumbnail: initialData?.thumbnail || "",
        fileUrl: initialData?.fileUrl || "",
        icon: initialData?.icon || "",
        value: initialData?.value || "",
        isPublished: initialData?.isPublished || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Auto-generate slug if title changes and it's not edit mode (or if slug is empty)
        if (name === 'title' && (!isEdit || !formData.slug)) {
            const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug: generatedSlug, title: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.slug || !formData.category) {
            toast.error("Please fill in all required fields (Title, Slug, Category)");
            return;
        }

        setIsSaving(true);
        try {
            const dataToSubmit = {
                ...formData,
                priceIdr: parseInt(formData.priceIdr) || 0,
                priceRunes: parseInt(formData.priceRunes) || 0
            };

            let result;
            if (isEdit && initialData?.id) {
                result = await updateDigitalProduct(initialData.id, dataToSubmit);
            } else {
                result = await createDigitalProduct(dataToSubmit);
            }

            if (result.success) {
                toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
                router.back();
                router.refresh();
            } else {
                toast.error(result.error || `Failed to ${isEdit ? 'update' : 'create'} product`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size must be less than 5MB");
            return;
        }

        setIsUploadingThumb(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadDigitalProductThumbnail(formData);
            if (result.success && result.url) {
                setFormData(prev => ({ ...prev, thumbnail: result.url }));
                toast.success("Thumbnail uploaded successfully");
            } else {
                toast.error(result.error || "Failed to upload thumbnail");
            }
        } catch (error) {
            toast.error("An error occurred during upload");
        } finally {
            setIsUploadingThumb(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors border border-slate-200 dark:border-white/5"
                    >
                        <ArrowLeft size={20} className="text-slate-700 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {isEdit ? "Edit Product" : "New Product"}
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-1">
                            {isEdit ? "Update the details of your product." : "Create a new digital product or cosmetic."}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--site-button)] text-[var(--site-button-text)] rounded-xl font-bold shadow-lg shadow-[var(--site-accent)]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Saving..." : "Save Product"}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2rem] shadow-xl dark:shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-[var(--site-secondary)]" />
                            Basic Information
                        </h2>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Premium UI Kit or Neon Frame"
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[var(--site-accent)]/50 transition-colors font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Slug *</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="e.g. premium-ui-kit"
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[var(--site-accent)]/50 transition-colors font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Describe your product or cosmetic item..."
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[var(--site-accent)]/50 transition-colors font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2rem] shadow-xl dark:shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <LinkIcon size={20} className="text-blue-500" />
                            Media & Digital Assets
                        </h2>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Cover Image URL</label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <ImageIcon size={16} className="text-slate-400 dark:text-gray-500" />
                                            </div>
                                            <input
                                                type="url"
                                                name="coverImage"
                                                value={formData.coverImage}
                                                onChange={handleChange}
                                                placeholder="https://..."
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Thumbnail</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1 relative">
                                            {formData.thumbnail ? (
                                                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                                    <Image src={formData.thumbnail} alt="Thumbnail preview" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: "" }))}
                                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-lg text-white backdrop-blur-md transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="image/png, image/jpeg, image/webp"
                                                        onChange={handleThumbnailUpload}
                                                        disabled={isUploadingThumb}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    />
                                                    <div className={`w-full h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed ${isUploadingThumb ? 'border-[var(--site-accent)]/50 bg-[var(--site-accent)]/5' : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 hover:bg-slate-50 dark:hover:bg-white/5'} transition-all`}>
                                                        {isUploadingThumb ? (
                                                            <>
                                                                <Loader2 size={24} className="text-[var(--site-accent)] animate-spin" />
                                                                <span className="text-sm font-medium text-[var(--site-accent)]">Uploading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                                                    <ImageIcon size={20} className="text-slate-500 dark:text-gray-400" />
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-500 dark:text-gray-400">Click to upload thumbnail</span>
                                                                <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input type="hidden" name="thumbnail" value={formData.thumbnail} />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Product File / Access URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon size={16} className="text-slate-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="url"
                                        name="fileUrl"
                                        value={formData.fileUrl}
                                        onChange={handleChange}
                                        placeholder="Google Drive link or downloadable file..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">Only accessible after successful payment.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2rem] shadow-xl dark:shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Sparkles size={20} className="text-fuchsia-500" />
                            Cosmetic Attributes
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Icon URL (Shop items)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ImageIcon size={16} className="text-slate-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Value / CSS Class</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText size={16} className="text-slate-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleChange}
                                        placeholder="e.g. from-blue-500 to-purple-500"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1 mt-2">Only needed for Cosmetics like Frames, Backgrounds, Effects.</p>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2rem] shadow-xl dark:shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Tag size={20} className="text-purple-500" />
                            Classification
                        </h2>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Type *</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 transition-colors font-medium appearance-none"
                                >
                                    <option value="DIGITAL_ASSET">Digital Asset</option>
                                    <option value="EBOOK">E-Book</option>
                                    <option value="COURSE">Video Course</option>
                                    <option value="TEMPLATE">Template</option>
                                    <option value="SOFTWARE">Software</option>
                                    <option value="SAAS_TEMPLATE">SaaS Template</option>
                                    <option value="FRAME">Profile Frame</option>
                                    <option value="EFFECT">Profile Effect</option>
                                    <option value="BACKGROUND">Profile Background</option>
                                    <option value="COMPONENT">UI Component</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 transition-colors font-medium appearance-none"
                                >
                                    <option value="EBOOK">E-Book</option>
                                    <option value="COURSE">Video Course</option>
                                    <option value="TEMPLATE">Template</option>
                                    <option value="SOFTWARE">Software</option>
                                    <option value="ASSET">Digital Asset</option>
                                    <option value="cosmetics">Cosmetics (Shop)</option>
                                    <option value="designs">Designs (Shop)</option>
                                    <option value="apps">Apps</option>
                                </select>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.isPublished ? "bg-green-500" : "bg-slate-300 dark:bg-zinc-700"}`} onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}>
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.isPublished ? "translate-x-4" : "translate-x-0"}`} />
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">Published</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2">If unpublished, users will not be able to buy or see this product.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2rem] shadow-xl dark:shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <DollarSign size={20} className="text-yellow-500" />
                            Pricing
                        </h2>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Price (IDR)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 dark:text-gray-500 font-bold">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="priceIdr"
                                        min="0"
                                        value={formData.priceIdr}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-bold"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">Leave as 0 if not purchasable with real money.</p>
                            </div>

                            <div className="space-y-2 border-t border-slate-200 dark:border-white/5 pt-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Price (Runes)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Sparkles size={14} className="text-yellow-500" />
                                    </div>
                                    <input
                                        type="number"
                                        name="priceRunes"
                                        min="0"
                                        value={formData.priceRunes}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-bold"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">Leave as 0 if not purchasable with platform points.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
