"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";

export async function getServiceById(id: string) {
    try {
        const service = await prisma.service.findUnique({
            where: { id }
        });
        return { success: true, data: service };
    } catch (error) {
        console.error("Error fetching service:", error);
        return { success: false, error: "Failed to fetch service" };
    }
}

export async function createService(data: any) {
    try {
        await prisma.service.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price ? parseInt(data.price) : null,
                imageUrl: data.imageUrl,
                features: data.features,
                buttonText: data.buttonText,
                orderLink: data.orderLink,
                gallery: data.gallery || []
            }
        });
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Error creating service:", error);
        return { success: false, error: "Failed to create service" };
    }
}

export async function updateService(id: string, data: any) {
    try {
        await prisma.service.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                price: data.price ? parseInt(data.price) : null,
                imageUrl: data.imageUrl,
                features: data.features,
                buttonText: data.buttonText,
                orderLink: data.orderLink,
                gallery: data.gallery || []
            }
        });
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Error updating service:", error);
        return { success: false, error: "Failed to update service" };
    }
}

export async function uploadServiceAsset(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const type = formData.get("type") as "image" | "file";

        if (!file) return { success: false, error: "No file uploaded" };

        const asset = await writeClient.assets.upload(type === "image" ? "image" : "file", file, {
            contentType: file.type,
            filename: file.name,
        });

        return { success: true, url: asset.url, assetId: asset._id };
    } catch (error: any) {
        console.error("Upload service asset error:", error);
        return { success: false, error: error.message || "Upload failed" };
    }
}

export async function deleteService(serviceId: string) {
    try {
        await prisma.service.delete({
            where: { id: serviceId }
        });
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Error deleting service:", error);
        return { success: false, error: "Failed to delete service" };
    }
}

export async function bulkDeleteServices(serviceIds: string[]) {
    try {
        await prisma.service.deleteMany({
            where: {
                id: {
                    in: serviceIds
                }
            }
        });
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting services:", error);
        return { success: false, error: "Failed to delete services" };
    }
}
