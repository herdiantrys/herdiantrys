"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";

export async function getPartners() {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: partners };
    } catch (error) {
        console.error("Error fetching partners:", error);
        return { success: false, error: "Failed to fetch partners" };
    }
}

export async function getPartnerById(id: string) {
    try {
        const partner = await prisma.partner.findUnique({
            where: { id }
        });
        return { success: true, data: partner };
    } catch (error) {
        console.error("Error fetching partner:", error);
        return { success: false, error: "Failed to fetch partner" };
    }
}

export async function createPartner(data: any) {
    try {
        await prisma.partner.create({
            data: {
                name: data.name,
                icon: data.icon,
                iconDark: data.iconDark,
                url: data.url
            }
        });
        revalidatePath("/admin/partners");
        return { success: true };
    } catch (error) {
        console.error("Error creating partner:", error);
        return { success: false, error: "Failed to create partner" };
    }
}

export async function updatePartner(id: string, data: any) {
    try {
        await prisma.partner.update({
            where: { id },
            data: {
                name: data.name,
                icon: data.icon,
                iconDark: data.iconDark,
                url: data.url
            }
        });
        revalidatePath("/admin/partners");
        return { success: true };
    } catch (error) {
        console.error("Error updating partner:", error);
        return { success: false, error: "Failed to update partner" };
    }
}

export async function deletePartner(id: string) {
    try {
        await prisma.partner.delete({
            where: { id }
        });
        revalidatePath("/admin/partners");
        return { success: true };
    } catch (error) {
        console.error("Error deleting partner:", error);
        return { success: false, error: "Failed to delete partner" };
    }
}

export async function bulkDeletePartners(ids: string[]) {
    try {
        await prisma.partner.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        revalidatePath("/admin/partners");
        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting partners:", error);
        return { success: false, error: "Failed to delete partners" };
    }
}

export async function uploadPartnerAsset(formData: FormData) {
    try {
        const file = formData.get("file") as File;

        if (!file) return { success: false, error: "No file uploaded" };

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        return { success: true, url: asset.url, assetId: asset._id };
    } catch (error: any) {
        console.error("Upload partner asset error:", error);
        return { success: false, error: error.message || "Upload failed" };
    }
}
