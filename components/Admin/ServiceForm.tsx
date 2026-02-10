"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createService, updateService, uploadServiceAsset } from "@/lib/actions/service.actions";
import { ArrowLeft, Save, Plus, Trash2, X, Upload, Video, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod Schema
const serviceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    price: z.string().optional(),
    imageUrl: z.string().optional(),
    buttonText: z.string().optional(),
    orderLink: z.string().optional(),
    features: z.array(z.string()).optional(),
    gallery: z.array(z.object({
        type: z.enum(['image', 'video']),
        url: z.string()
    })).optional()
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServiceForm({ service, isEdit = false }: { service?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const { register, control, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            title: service?.title || "",
            description: service?.description || "",
            price: service?.price?.toString() || "",
            imageUrl: service?.imageUrl || "",
            buttonText: service?.buttonText || "",
            orderLink: service?.orderLink || "",
            features: service?.features && Array.isArray(service.features) ? service.features : [],
            gallery: service?.gallery || []
        }
    });

    const imageUrl = watch("imageUrl");
    const gallery = watch("gallery") || [];

    // Custom handler for array of strings since useFieldArray works best with objects
    const [featureInput, setFeatureInput] = useState("");
    const [featuresList, setFeaturesList] = useState<string[]>(
        service?.features && Array.isArray(service.features) ? service.features : []
    );

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFeaturesList([...featuresList, featureInput.trim()]);
            setFeatureInput("");
        }
    };

    const handleRemoveFeature = (index: number) => {
        const newList = [...featuresList];
        newList.splice(index, 1);
        setFeaturesList(newList);
    };

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "imageUrl" | "gallery") => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            const type = file.type.startsWith('image/') ? 'image' : 'file';
            formData.append("type", type);

            const promise = uploadServiceAsset(formData);

            toast.promise(promise, {
                loading: "Uploading asset...",
                success: (res) => {
                    if (res.success && res.url) {
                        return "Asset uploaded!";
                    }
                    throw new Error(res.error || "Upload failed");
                },
                error: (err) => `Upload failed: ${err.message}`
            });

            const res = await promise;
            if (res.success && res.url) {
                if (fieldName === "imageUrl") {
                    setValue("imageUrl", res.url);
                } else {
                    const currentGallery = getValues("gallery") || [];
                    const newGalleryItem = {
                        type: file.type.startsWith('image/') ? 'image' : 'video' as const,
                        url: res.url
                    };
                    setValue("gallery", [...currentGallery, newGalleryItem]);
                }
            }
        }
    };

    const removeGalleryItem = (index: number) => {
        const currentGallery = getValues("gallery") || [];
        const newGallery = [...currentGallery];
        newGallery.splice(index, 1);
        setValue("gallery", newGallery);
    };

    const onSubmit = async (data: ServiceFormData) => {
        setSubmitting(true);
        try {
            const finalData = { ...data, features: featuresList };

            let res;
            if (isEdit && service?.id) {
                res = await updateService(service.id, finalData);
            } else {
                res = await createService(finalData);
            }

            if (res.success) {
                toast.success(isEdit ? "Service updated" : "Service created");
                router.push("/admin/services");
            } else {
                toast.error(res.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/services"
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {isEdit ? "Edit Service" : "New Service"}
                    </h1>
                    <p className="text-sm text-gray-400">
                        {isEdit ? "Update service details" : "Create a new service offering"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Basic Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 text-white">Basic Details</h2>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Service Title</label>
                                <input
                                    {...register("title")}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                                    placeholder="e.g. Web Development"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all"
                                    placeholder="Brief description of the service..."
                                />
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Price (IDR)</label>
                                <input
                                    {...register("price")}
                                    type="number"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all font-mono"
                                    placeholder="e.g. 1500000"
                                />
                            </div>
                        </div>

                        {/* Action & Links */}
                        <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 text-white">Call to Action</h2>

                            {/* Button Text */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Button Text</label>
                                <input
                                    {...register("buttonText")}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all"
                                    placeholder="e.g. Order Now"
                                />
                            </div>

                            {/* Order Link */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Order Link</label>
                                <input
                                    {...register("orderLink")}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Features & Media */}
                    <div className="space-y-6">

                        {/* Image Upload */}
                        <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 text-white">Cover Image</h2>
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-black/40 border-2 border-dashed border-gray-200 dark:border-white/10 group hover:border-teal-500 dark:hover:border-teal-500/50 transition-all duration-300">
                                {imageUrl ? (
                                    <>
                                        <Image src={imageUrl} alt="Cover" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2"><Upload size={18} /> Change Image</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3 group-hover:text-teal-500 transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-500/10 transition-colors">
                                            <ImageIcon size={24} />
                                        </div>
                                        <p className="text-sm font-medium">Click to upload cover image</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleAssetUpload(e, "imageUrl")}
                                />
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 text-white">Features</h2>

                            <div className="flex gap-2 mb-4">
                                <input
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                    placeholder="Add a feature..."
                                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-teal-500/50"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors"
                                >
                                    <Plus size={20} className="text-teal-400" />
                                </button>
                            </div>

                            <ul className="space-y-2">
                                {featuresList.map((feat, idx) => (
                                    <li key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 group">
                                        <span className="text-sm text-gray-300">{feat}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </li>
                                ))}
                                {featuresList.length === 0 && (
                                    <li className="text-center text-sm text-gray-500 py-4">No features added yet.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Gallery Section - Full Width */}
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                    <h2 className="text-lg font-semibold mb-4 text-white">Service Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Upload Button */}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-teal-500 dark:hover:border-teal-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-gray-50 dark:bg-black/20">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-500/10 transition-colors mb-2">
                                <Upload size={20} className="text-gray-400 dark:text-gray-500 group-hover:text-teal-500" />
                            </div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-teal-500 text-center px-2">Add Images / Videos</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => handleAssetUpload(e, "gallery")}
                            />
                        </label>

                        {/* Gallery Items */}
                        {gallery.map((item, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 dark:border-white/10 bg-black">
                                {item.type === 'video' ? (
                                    <video src={item.url} className="w-full h-full object-cover opacity-80" />
                                ) : (
                                    <Image src={item.url} alt={`Gallery ${index}`} fill className="object-cover" />
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryItem(index)}
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

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-white/5">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {submitting ? "Saving..." : (
                            <>
                                <Save size={18} />
                                Save Service
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
