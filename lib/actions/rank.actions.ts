"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";

export const getRanks = async () => {
    try {
        const ranks = await prisma.rank.findMany({
            orderBy: { minXP: 'asc' }
        });
        return ranks;
    } catch (error) {
        console.error("Error fetching ranks:", error);
        return [];
    }
};

export const createRank = async (data: any) => {
    try {
        await prisma.rank.create({
            data: {
                name: data.name,
                subtitle: data.subtitle,
                minXP: parseInt(data.minXP),
                description: data.description,
                image: data.image
            }
        });
        revalidatePath("/admin/ranks");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating rank:", error);
        if (error.code === 'P2002') {
            return { success: false, error: "A rank with this Min XP already exists." };
        }
        return { success: false, error: "Failed to create rank" };
    }
};

export const updateRank = async (id: string, data: any) => {
    try {
        await prisma.rank.update({
            where: { id },
            data: {
                name: data.name,
                subtitle: data.subtitle,
                minXP: parseInt(data.minXP),
                description: data.description,
                image: data.image
            }
        });
        revalidatePath("/admin/ranks");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating rank:", error);
        if (error.code === 'P2002') {
            return { success: false, error: "A rank with this Min XP already exists." };
        }
        return { success: false, error: "Failed to update rank" };
    }
};

export const deleteRank = async (id: string) => {
    try {
        await prisma.rank.delete({
            where: { id }
        });
        revalidatePath("/admin/ranks");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Error deleting rank:", error);
        return { success: false, error: "Failed to delete rank" };
    }
};

export const uploadRankImage = async (formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        return { success: true, imageUrl: asset.url };
    } catch (error) {
        console.error("Error uploading rank image:", error);
        return { success: false, error: "Failed to upload image" };
    }
};
