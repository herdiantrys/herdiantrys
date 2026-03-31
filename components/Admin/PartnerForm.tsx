"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPartner, updatePartner } from "@/lib/actions/partner.actions";
import { ArrowLeft, Save, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { resolveAssetUrl } from "@/lib/media";
import { MediaLibraryModal, type MediaAssetRecord } from "@/components/Admin/MediaLibrary";

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
    const [activeLibraryField, setActiveLibraryField] = useState<null | "icon" | "iconDark">(null);

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

    const handleLibrarySelection = (assets: MediaAssetRecord[]) => {
        const selectedAsset = assets[0];
        if (!selectedAsset || !activeLibraryField) {
            setActiveLibraryField(null);
            return;
        }

        setValue(activeLibraryField, selectedAsset.url);
        setActiveLibraryField(null);
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
                                    <div className="relative z-10 w-full h-full pointer-events-none">
                                        <Image src={resolveAssetUrl(iconUrl)} alt="Logo Light" fill className="object-contain p-4" />
                                        <button
                                            type="button"
                                            onClick={() => setValue("icon", "")}
                                            className="pointer-events-auto absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-teal-500">
                                        <ImageIcon size={20} />
                                        <span className="text-xs mt-2">Upload Light</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveLibraryField("icon")}
                                    className="absolute inset-0 z-0"
                                    aria-label="Open light logo media library"
                                />
                            </div>
                        </div>

                        {/* Dark Mode Icon */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Dark Mode Logo</label>
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-black/80 border-2 border-dashed border-gray-200 dark:border-white/10 group hover:border-teal-500 dark:hover:border-teal-500/50 transition-all">
                                {iconDarkUrl ? (
                                    <div className="relative z-10 w-full h-full pointer-events-none">
                                        <Image src={resolveAssetUrl(iconDarkUrl)} alt="Logo Dark" fill className="object-contain p-4" />
                                        <button
                                            type="button"
                                            onClick={() => setValue("iconDark", "")}
                                            className="pointer-events-auto absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-teal-500">
                                        <ImageIcon size={20} />
                                        <span className="text-xs mt-2">Upload Dark</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveLibraryField("iconDark")}
                                    className="absolute inset-0 z-0"
                                    aria-label="Open dark logo media library"
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

            <MediaLibraryModal
                open={activeLibraryField !== null}
                onClose={() => setActiveLibraryField(null)}
                onConfirmSelection={handleLibrarySelection}
                title="Pilih Logo Partner"
                description="Pilih gambar yang sudah pernah diupload atau upload file baru langsung dari popup ini."
                preferredFolder="partner_images"
                allowedKinds={["IMAGE"]}
            />
        </div>
    );
}
