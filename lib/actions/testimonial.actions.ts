"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadLocalFile } from "@/lib/upload";

export async function getTestimonials() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: testimonials };
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return { success: false, error: "Failed to fetch testimonials" };
    }
}

export async function getTestimonialById(id: string) {
    try {
        const testimonial = await prisma.testimonial.findUnique({
            where: { id }
        });
        return { success: true, data: testimonial };
    } catch (error) {
        console.error("Error fetching testimonial:", error);
        return { success: false, error: "Failed to fetch testimonial" };
    }
}

export async function createTestimonial(data: any) {
    try {
        await prisma.testimonial.create({
            data: {
                name: data.name,
                role: data.role,
                content: data.content,
                photo: data.photo
            }
        });
        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error creating testimonial:", error);
        return { success: false, error: "Failed to create testimonial" };
    }
}

export async function updateTestimonial(id: string, data: any) {
    try {
        await prisma.testimonial.update({
            where: { id },
            data: {
                name: data.name,
                role: data.role,
                content: data.content,
                photo: data.photo
            }
        });
        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error updating testimonial:", error);
        return { success: false, error: "Failed to update testimonial" };
    }
}

export async function deleteTestimonial(id: string) {
    try {
        await prisma.testimonial.delete({
            where: { id }
        });
        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        return { success: false, error: "Failed to delete testimonial" };
    }
}

export async function bulkDeleteTestimonials(ids: string[]) {
    try {
        await prisma.testimonial.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting testimonials:", error);
        return { success: false, error: "Failed to delete testimonials" };
    }
}

export async function uploadTestimonialAsset(formData: FormData) {
    try {
        const file = formData.get("file") as File;

        if (!file) return { success: false, error: "No file uploaded" };

        const url = await uploadLocalFile(file, "testimonial_images");

        return { success: true, url: url, assetId: url };
    } catch (error: any) {
        console.error("Upload testimonial asset error:", error);
        return { success: false, error: error.message || "Upload failed" };
    }
}
