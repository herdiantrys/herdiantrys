"use server";

import { auth } from "@/auth";

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

        // Use raw query for frameColor as fallback if Prisma Client is out of sync
        let dbFrameColor = null;
        try {
            const rawUser = await prisma.$queryRawUnsafe(`SELECT frameColor FROM User WHERE id = ?`, userId) as any[];
            dbFrameColor = rawUser[0]?.frameColor;
        } catch (e) {
            console.warn("Raw query failed, likely frameColor column doesn't exist yet:", e);
        }

        return {
            inventory: inventory.map(item => ({
                ...item.shopItem,
                acquiredAt: item.acquiredAt,
                inventoryId: item.id
            })),
            equippedFrame: user?.equippedFrame || null,
            equippedBackground: user?.equippedBackground || null,
            profileColor: user?.profileColor || null,
            frameColor: dbFrameColor || (user as any)?.frameColor || null
        };
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return {
            inventory: [],
            equippedFrame: null,
            equippedBackground: null,
            profileColor: null,
            frameColor: null
        };
    }
}

export async function toggleEquipItem(userId: string, itemValue: string, type: "FRAME" | "BACKGROUND", isEquipped: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        const updateData: any = {};

        if (type === "FRAME") {
            updateData.equippedFrame = isEquipped ? null : itemValue;
        } else if (type === "BACKGROUND") {
            if (itemValue === "custom-image" && !isEquipped) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { preferences: true }
                });
                const prefs = (user?.preferences as Record<string, any>) || {};
                updateData.equippedBackground = prefs.customBackgroundUrl || itemValue;
            } else {
                updateData.equippedBackground = isEquipped ? null : itemValue;
            }

            if (!isEquipped && itemValue !== "custom-color") {
                updateData.profileColor = null;
            } else if (isEquipped && itemValue === "custom-color") {
                updateData.profileColor = null;
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath("/dashboard");
        revalidatePath("/digitalproducts");

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user?.username) {
            revalidatePath(`/profile/${user.username}`);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update equipment" };
    }
}

export async function updateProfileColor(userId: string, color: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { profileColor: color }
        });

        revalidatePath("/dashboard");
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user?.username) {
            revalidatePath(`/profile/${user.username}`);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update color" };
    }
}

export async function updateFrameColor(userId: string, color: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.$executeRawUnsafe(`UPDATE User SET frameColor = ? WHERE id = ?`, color, userId);

        revalidatePath("/dashboard");
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user?.username) {
            revalidatePath(`/profile/${user.username}`);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update frame color" };
    }
}

/**
 * Legacy digital inventory fetcher - now just calls getUserInventory and filters for digital products.
 */
export async function getUserDigitalInventory() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const data = await getUserInventory(session.user.id);
        const digitalItems = data.inventory.filter(item =>
            !["FRAME", "BACKGROUND", "BANNER_VIDEO"].includes(item.type)
        );

        const serialized = digitalItems.map(item => ({
            ...item,
            acquiredAt: item.acquiredAt ? new Date(item.acquiredAt).toISOString() : new Date().toISOString(),
            product: {
                ...item,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        }));

        return {
            success: true,
            inventory: serialized
        };
    } catch (error: any) {
        console.error("Failed to fetch user digital inventory:", error);
        return { success: false, error: "Failed to fetch digital inventory data." };
    }
}

