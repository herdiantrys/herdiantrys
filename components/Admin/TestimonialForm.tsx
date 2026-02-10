"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTestimonial, updateTestimonial, uploadTestimonialAsset } from "@/lib/actions/testimonial.actions";
import { ArrowLeft, Save, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod Schema
const testimonialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.string().optional(),
    content: z.string().optional(),
    photo: z.string().optional()
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export default function TestimonialForm({ testimonial, isEdit = false }: { testimonial?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TestimonialFormData>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
            name: testimonial?.name || "",
            role: testimonial?.role || "",
            content: testimonial?.content || "",
            photo: testimonial?.photo || ""
        }
    });

    const photoUrl = watch("photo");

    const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const promise = uploadTestimonialAsset(formData);

        toast.promise(promise, {
            loading: "Uploading photo...",
            success: (res) => {
                if (res.success && res.url) {
                    setValue("photo", res.url);
                    return "Photo uploaded!";
                }
                throw new Error(res.error || "Upload failed");
            },
            error: (err) => `Upload failed: ${err.message}`
        });
    };

    const onSubmit = async (data: TestimonialFormData) => {
        setSubmitting(true);
        try {
            let res;
            if (isEdit && testimonial?.id) {
                res = await updateTestimonial(testimonial.id, data);
            } else {
                res = await createTestimonial(data);
            }

            if (res.success) {
                toast.success(isEdit ? "Testimonial updated" : "Testimonial created");
                router.push("/admin/testimonials");
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
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/testimonials"
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {isEdit ? "Edit Testimonial" : "New Testimonial"}
                    </h1>
                    <p className="text-sm text-gray-400">
                        {isEdit ? "Update testimonial details" : "Add a new testimonial"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Input Fields */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 text-white">Details</h2>

                            {/* Name */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Author Name</label>
                                <input
                                    {...register("name")}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                                    placeholder="e.g. John Doe"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            {/* Role */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Role / Company</label>
                                <input
                                    {...register("role")}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all"
                                    placeholder="e.g. CEO, Acme Inc."
                                />
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Testimonial Content</label>
                                <textarea
                                    {...register("content")}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-all"
                                    placeholder="What did they say?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Photo Upload */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1A1A1A]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 text-white">Author Photo</h2>
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-black/40 border-2 border-dashed border-gray-200 dark:border-white/10 group hover:border-teal-500 dark:hover:border-teal-500/50 transition-all">
                                {photoUrl ? (
                                    <div className="relative w-full h-full">
                                        <Image src={photoUrl} alt="Photo" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setValue("photo", "")}
                                            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-teal-500">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                            <ImageIcon size={24} />
                                        </div>
                                        <p className="text-sm font-medium">Upload Photo</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleAssetUpload}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Square image recommended.
                            </p>
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
                                Save Testimonial
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
