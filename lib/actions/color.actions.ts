"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- COLORS ---

export async function getAppColors() {
    try {
        const colors = await prisma.appColor.findMany({
            orderBy: { createdAt: "asc" },
        });
        return { success: true, data: colors };
    } catch (error: any) {
        console.error("Error fetching colors:", error);
        return { success: false, error: "Failed to fetch colors" };
    }
}

export async function createAppColor(data: { name: string; hex: string; rgb: string; cmyk: string; family: string }) {
    try {
        const color = await prisma.appColor.create({
            data,
        });
        revalidatePath("/apps/color-space");
        revalidatePath("/admin/colors");
        return { success: true, data: color };
    } catch (error: any) {
        console.error("Error creating color:", error);
        return { success: false, error: "Failed to create color" };
    }
}

export async function updateAppColor(id: string, data: { name: string; hex: string; rgb: string; cmyk: string; family: string }) {
    try {
        const color = await prisma.appColor.update({
            where: { id },
            data,
        });
        revalidatePath("/apps/color-space");
        revalidatePath("/admin/colors");
        return { success: true, data: color };
    } catch (error: any) {
        console.error("Error updating color:", error);
        return { success: false, error: "Failed to update color" };
    }
}

export async function deleteAppColor(id: string) {
    try {
        await prisma.appColor.delete({
            where: { id },
        });
        revalidatePath("/apps/color-space");
        revalidatePath("/admin/colors");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting color:", error);
        return { success: false, error: "Failed to delete color" };
    }
}

export async function bulkDeleteAppColors(ids: string[]) {
    try {
        await prisma.appColor.deleteMany({
            where: { id: { in: ids } },
        });
        revalidatePath("/apps/color-space");
        revalidatePath("/admin/colors");
        return { success: true };
    } catch (error: any) {
        console.error("Error bulk deleting colors:", error);
        return { success: false, error: "Failed to delete colors" };
    }
}

// --- PALETTES ---

export async function getAppPalettes() {
    try {
        const palettes = await prisma.appPalette.findMany({
            orderBy: { createdAt: "asc" },
        });
        return { success: true, data: palettes };
    } catch (error: any) {
        console.error("Error fetching palettes:", error);
        return { success: false, error: "Failed to fetch palettes" };
    }
}

// Simplified Palettes creation for admin
export async function createAppPalette(data: { name: string; colors: string; tags: string }) {
    try {
        const palette = await prisma.appPalette.create({
            data: {
                name: data.name,
                colors: JSON.parse(data.colors),
                tags: JSON.parse(data.tags),
            },
        });
        revalidatePath("/apps/color-space");
        revalidatePath("/admin/colors");
        return { success: true, data: palette };
    } catch (error: any) {
        console.error("Error creating palette:", error);
        return { success: false, error: "Failed to create palette! Make sure colors/tags are valid JSON strings." };
    }
}

export async function deleteAppPalette(id: string) {
    try {
        await prisma.appPalette.delete({
            where: { id },
        });
        revalidatePath("/apps/color-space");
        revalidatePath("/admin/colors");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting palette:", error);
        return { success: false, error: "Failed to delete palette" };
    }
}
