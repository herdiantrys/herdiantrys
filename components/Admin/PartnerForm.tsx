"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPartner, updatePartner, uploadPartnerAsset } from "@/lib/actions/partner.actions";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod Schema
const partnerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().optional(),
    icon: z.string().optional(),
    iconDark: z.string().optional()
});

type PartnerFormData = z.infer<typeof partnerSchema>;

export default function PartnerForm({ partner, isEdit = false }: { partner?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PartnerFormData>({
        resolver: zodResolver(partnerSchema),
        defaultValues: {
            name: partner?.name || "",
            url: partner?.url || "",
            icon: partner?.icon || "",
            iconDark: partner?.iconDark || ""
        }
    });

    const iconUrl = watch("icon");
    const iconDarkUrl = watch("iconDark");

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "icon" | "iconDark") => {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const promise = uploadPartnerAsset(formData);

        toast.promise(promise, {
            loading: `Uploading ${fieldName === 'icon' ? 'light' : 'dark'} icon...`,
            success: (res) => {
                if (res.success && res.url) {
                    setValue(fieldName, res.url);
                    return "Icon uploaded!";
                }
                throw new Error(res.error || "Upload failed");
            },
            error: (err) => `Upload failed: ${err.message}`
        });
    };

    const onSubmit = async (data: PartnerFormData) => {
        setSubmitting(true);
        try {
            let res;
            if (isEdit && partner?.id) {
                res = await updatePartner(partner.id, data);
            } else {
                res = await createPartner(data);
            }

            if (res.success) {
                toast.success(isEdit ? "Partner updated" : "Partner created");
                router.push("/admin/partners");
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
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/partners"
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {isEdit ? "Edit Partner" : "New Partner"}
                    </h1>
                    <p className="text-sm text-gray-400">
                        {isEdit ? "Update partner details" : "Add a new partner"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                    <h2 className="text-lg font-semibold mb-4 text-white">Partner Details</h2>

                    {/* Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Partner Name</label>
                        <input
                            {...register("name")}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                            placeholder="e.g. Acme Corp"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Website URL */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Website URL</label>
                        <input
                            {...register("url")}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all font-mono text-sm"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Light Mode Icon */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Light Mode Logo</label>
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-white/50 border-2 border-dashed border-gray-200 dark:border-white/10 group hover:border-teal-500 dark:hover:border-teal-500/50 transition-all">
                                {iconUrl ? (
                                    <div className="relative w-full h-full">
                                        <Image src={iconUrl} alt="Logo Light" fill className="object-contain p-4" />
                                        <button
                                            type="button"
                                            onClick={() => setValue("icon", "")}
                                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-teal-500">
                                        <ImageIcon size={20} />
                                        <span className="text-xs mt-2">Upload Light</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleAssetUpload(e, "icon")}
                                />
                            </div>
                        </div>

                        {/* Dark Mode Icon */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Dark Mode Logo</label>
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-black/80 border-2 border-dashed border-gray-200 dark:border-white/10 group hover:border-teal-500 dark:hover:border-teal-500/50 transition-all">
                                {iconDarkUrl ? (
                                    <div className="relative w-full h-full">
                                        <Image src={iconDarkUrl} alt="Logo Dark" fill className="object-contain p-4" />
                                        <button
                                            type="button"
                                            onClick={() => setValue("iconDark", "")}
                                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-teal-500">
                                        <ImageIcon size={20} />
                                        <span className="text-xs mt-2">Upload Dark</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleAssetUpload(e, "iconDark")}
                                />
                            </div>
                        </div>
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
                                Save Partner
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
