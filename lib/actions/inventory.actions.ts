"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserInventory(userId: string) {
    try {
        const inventory = await prisma.userInventory.findMany({
            where: { userId },
            include: {
                shopItem: true
            },
            orderBy: {
                acquiredAt: 'desc'
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                equippedFrame: true,
                equippedBackground: true,
                profileColor: true
            }
        });

        return {
            inventory: inventory.map(item => ({
                ...item.shopItem,
                acquiredAt: item.acquiredAt,
                inventoryId: item.id
            })),
            equippedFrame: user?.equippedFrame || null,
            equippedBackground: user?.equippedBackground || null,
            profileColor: user?.profileColor || null
        };
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return {
            inventory: [],
            equippedFrame: null,
            equippedBackground: null,
            profileColor: null
        };
    }
}

export async function toggleEquipItem(userId: string, itemValue: string, type: "FRAME" | "BACKGROUND", isEquipped: boolean) {
    try {
        const updateData: any = {};

        if (type === "FRAME") {
            updateData.equippedFrame = isEquipped ? null : itemValue;
        } else if (type === "BACKGROUND") {
            updateData.equippedBackground = isEquipped ? null : itemValue;
            if (!isEquipped) {
                updateData.profileColor = null; // Background overrides color
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath("/dashboard");
        revalidatePath("/shop");

        // Revalidate user profile
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user?.username) {
            revalidatePath(`/user/${user.username}`);
            revalidatePath(`/profile/${user.username}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error toggling item equipment:", error);
        return { success: false, error: "Failed to update equipment" };
    }
}
