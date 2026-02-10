"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getShopItems = async () => {
    try {
        const items = await prisma.shopItem.findMany({
            orderBy: { price: 'asc' }
        });

        // Map iconUrl if needed, assuming icon stored as URL string in Prisma
        return items.map(item => ({
            ...item,
            _id: item.id,
            iconUrl: item.icon
        }));
    } catch (error) {
        console.error("Error fetching shop items:", error);
        return [];
    }
};

export const seedShopItems = async () => {
    const items = [
        {
            name: "Neon Glow Frame (Blue)",
            description: "A cool neon blue border for your profile picture.",
            price: 100,
            type: "FRAME", // Enum
            value: "from-cyan-400 to-blue-600",
        },
        {
            name: "Neon Glow Frame (Pink)",
            description: "A dazzling neon pink border for your profile picture.",
            price: 100,
            type: "FRAME",
            value: "from-pink-500 to-purple-600",
        }
    ];

    try {
        for (const item of items) {
            // Find by name to avoid dupes or upsert if schema had unique restriction on name
            // Schema doesn't have unique name, but we can check.
            const existing = await prisma.shopItem.findFirst({ where: { name: item.name } });

            if (!existing) {
                await prisma.shopItem.create({
                    data: {
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        type: item.type as any,
                        value: item.value
                    }
                });
                console.log(`Seeded shop item: ${item.name}`);
            } else {
                // Optional: Update
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Error seeding shop items:", error);
        return { success: false, error: "Failed to seed items" };
    }
};

export const purchaseItem = async (userId: string, itemId: string, price: number, type: string, effectValue: string) => {
    try {
        // Transaction: Check Balance -> Deduct -> Add to Inventory -> Equip
        await prisma.$transaction(async (tx) => {
            // 1. Check User & Balance
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { inventory: true }
            });

            if (!user) throw new Error("User not found");
            if (user.points < price) throw new Error("Insufficient points");

            // 2. Check Ownership
            const isOwned = user.inventory.some((inv) => inv.shopItemId === itemId);
            if (isOwned) throw new Error("Item already owned");

            // 3. Prepare Update Data
            const updateData: any = {
                points: { decrement: price }
            };

            // Optional: Auto-equip logic depending on UX preference.
            // For now, let's auto-equip to match previous behavior, but respecting types.
            if (type.toUpperCase() === 'FRAME') {
                updateData.equippedFrame = effectValue;
            } else if (type.toUpperCase() === 'BACKGROUND') {
                updateData.equippedBackground = effectValue;
                updateData.profileColor = null; // Enforce mutual exclusivity
            } else {
                // Fallback for effects/others
                updateData.equippedEffect = effectValue;
            }

            // 3. Deduct Points & Equip
            await tx.user.update({
                where: { id: userId },
                data: updateData
            });

            // 4. Add to Inventory
            await tx.userInventory.create({
                data: {
                    userId: userId,
                    shopItemId: itemId
                }
            });
        });

        revalidatePath("/shop");
        revalidatePath("/dashboard");
        revalidatePath(`/user/${userId}`);
        revalidatePath("/inventory");

        return { success: true };
    } catch (error: any) {
        console.error("Error purchasing item:", error);
        return { success: false, error: error.message || "Transaction failed" };
    }
};

export const equipItem = async (userId: string, itemId: string, type: string, effectValue: string) => {
    try {
        const updateData: any = {};

        if (type.toUpperCase() === 'FRAME') {
            updateData.equippedFrame = effectValue;
        } else if (type.toUpperCase() === 'BACKGROUND') {
            updateData.equippedBackground = effectValue;
            updateData.profileColor = null;
        } else {
            updateData.equippedEffect = effectValue;
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        revalidatePath("/shop");
        revalidatePath("/dashboard");
        revalidatePath(`/user/${userId}`);
        revalidatePath("/inventory");

        return { success: true };
    } catch (error: any) {
        console.error("Error equipping item:", error);
        return { success: false, error: "Failed to equip item" };
    }
};

export const deleteShopItem = async (itemId: string, userId: string) => {
    try {
        // 1. Verify User Role (Admin Check)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || await isNotAdmin(userId)) {
            return { success: false, error: "Unauthorized" };
        }

        // 2. Delete from Database
        await prisma.shopItem.delete({
            where: { id: itemId }
        });

        revalidatePath("/admin/shop");
        revalidatePath("/shop");
        revalidatePath("/inventory");

        return { success: true };
    } catch (error) {
        console.error("Error deleting shop item:", error);
        return { success: false, error: "Failed to delete item" };
    }
};

export const bulkDeleteShopItems = async (itemIds: string[], userId: string) => {
    try {
        // 1. Verify User Role
        if (await isNotAdmin(userId)) {
            return { success: false, error: "Unauthorized" };
        }

        // 2. Delete items
        await prisma.shopItem.deleteMany({
            where: {
                id: { in: itemIds }
            }
        });

        revalidatePath("/admin/shop");
        revalidatePath("/shop");
        revalidatePath("/inventory");

        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting shop items:", error);
        return { success: false, error: "Failed to delete items" };
    }
};

// Helper to check admin status
async function isNotAdmin(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    return !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN");
}

export const updateShopItem = async (itemId: string, data: any, userId: string) => {
    try {
        if (await isNotAdmin(userId)) {
            return { success: false, error: "Unauthorized" };
        }

        // Create update data object with explicit cast for 'category' due to stale types
        const updateData: any = {
            name: data.name,
            description: data.description,
            price: parseInt(data.price),
            type: data.type,
            category: data.category,
            value: data.value,
            icon: data.icon
        };

        await prisma.shopItem.update({
            where: { id: itemId },
            data: updateData
        });

        revalidatePath("/admin/shop");
        revalidatePath("/shop");
        revalidatePath("/inventory");

        return { success: true };
    } catch (error) {
        console.error("Error updating shop item:", error);
        return { success: false, error: "Failed to update item" };
    }
};
