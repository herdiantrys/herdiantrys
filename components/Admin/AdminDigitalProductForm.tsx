"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Link as LinkIcon, FileText, Tag, DollarSign, Globe } from "lucide-react";
import Link from "next/link";
import { createDigitalProduct, updateDigitalProduct } from "@/lib/actions/digital-product.actions";
import { toast } from "sonner";
import Image from "next/image";

interface AdminDigitalProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function AdminDigitalProductForm({ initialData, isEdit = false }: AdminDigitalProductFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        description: initialData?.description || "",
        price: initialData?.price?.toString() || "0",
        currency: initialData?.currency || "IDR",
        category: initialData?.category || "EBOOK",
        coverImage: initialData?.coverImage || "",
        thumbnail: initialData?.thumbnail || "",
        fileUrl: initialData?.fileUrl || "",
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

        if (!formData.title || !formData.slug || !formData.price || !formData.category) {
            toast.error("Please fill in all required fields (Title, Slug, Price, Category)");
            return;
        }

        setIsSaving(true);
        try {
            const dataToSubmit = {
                ...formData,
                price: parseInt(formData.price) || 0
            };

            let result;
            if (isEdit && initialData?.id) {
                result = await updateDigitalProduct(initialData.id, dataToSubmit);
            } else {
                result = await createDigitalProduct(dataToSubmit);
            }

            if (result.success) {
                toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
                router.push("/admin/digitalproducts");
                router.refresh(); // Refresh the list
            } else {
                toast.error(result.error || `Failed to ${isEdit ? 'update' : 'create'} product`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/digitalproducts"
                        className="p-2 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors border border-slate-200 dark:border-white/5"
                    >
                        <ArrowLeft size={20} className="text-slate-700 dark:text-gray-300" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {isEdit ? "Edit Digital Product" : "New Digital Product"}
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-1">
                            {isEdit ? "Update the details of your digital product." : "Create a new digital product to sell."}
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
                                    placeholder="e.g. Complete Next.js Masterclass"
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
                                    placeholder="e.g. complete-nextjs-masterclass"
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[var(--site-accent)]/50 transition-colors font-medium"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">The URL-friendly identifier for this product.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Describe what's included in this digital product..."
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[var(--site-accent)]/50 transition-colors font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-[#1A1A1A]/40 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 p-8 rounded-[2rem] shadow-xl dark:shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <LinkIcon size={20} className="text-blue-500" />
                            Media & Files
                        </h2>

                        <div className="space-y-5">
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
                                            placeholder="https://example.com/image.png"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                                        />
                                    </div>
                                    {formData.coverImage && (
                                        <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden relative shrink-0 bg-slate-100 dark:bg-black/20">
                                            <Image src={formData.coverImage} alt="Preview" fill className="object-cover" unoptimized />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Thumbnail Image URL</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ImageIcon size={16} className="text-slate-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            type="url"
                                            name="thumbnail"
                                            value={formData.thumbnail}
                                            onChange={handleChange}
                                            placeholder="https://example.com/thumbnail.png"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[var(--site-accent)]/50 transition-colors font-medium"
                                        />
                                    </div>
                                    {formData.thumbnail && (
                                        <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden relative shrink-0 bg-slate-100 dark:bg-black/20">
                                            <Image src={formData.thumbnail} alt="Preview" fill className="object-cover" unoptimized />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
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
                                        placeholder="https://example.com/download.zip or Google Drive link"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 ml-1">Users will receive this link after successful payment.</p>
                            </div>
                        </div>
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
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Price Amount *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 dark:text-gray-500 font-bold">{formData.currency === 'IDR' ? 'Rp' : '$'}</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Currency</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe size={16} className="text-slate-400 dark:text-gray-500" />
                                    </div>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="w-full pl-10 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-medium appearance-none"
                                    >
                                        <option value="IDR">IDR - Indonesian Rupiah (QRIS/Bank)</option>
                                        <option value="USD">USD - US Dollar (Stripe)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
