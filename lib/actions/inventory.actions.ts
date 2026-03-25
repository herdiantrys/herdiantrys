"use server";

import { auth } from "@/auth";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    DEFAULT_COSMETIC_SHOP_ITEMS,
    getCosmeticShopSlug,
} from "@/lib/default-cosmetic-shop-items";
import {
    trackFirstShopPurchase,
    trackShopCompletion,
} from "@/lib/actions/gamification.actions";

const revalidateInventorySurfaces = (username?: string | null) => {
    revalidatePath("/dashboard");
    revalidatePath("/digitalproducts");
    revalidatePath("/inventory");

    if (username) {
        revalidatePath(`/profile/${username}`);
        revalidatePath(`/user/${username}`);
    }
};

const isEquippedItem = (
    type: "FRAME" | "BACKGROUND",
    itemValue: string | null | undefined,
    user: {
        equippedFrame?: string | null;
        equippedBackground?: string | null;
    }
) => {
    if (!itemValue) return false;

    if (type === "FRAME") {
        return user.equippedFrame === itemValue;
    }

    if (itemValue === "custom-image") {
        return Boolean(
            user.equippedBackground === "custom-image" ||
            user.equippedBackground?.startsWith("http") ||
            user.equippedBackground?.startsWith("/")
        );
    }

    return user.equippedBackground === itemValue;
};

async function ensureDefaultCosmeticShopItems() {
    for (const item of DEFAULT_COSMETIC_SHOP_ITEMS) {
        const existing = await prisma.shopItem.findFirst({
            where: {
                name: item.name,
                type: item.type
            }
        });

        if (!existing) {
            await prisma.shopItem.create({
                data: item
            });
            continue;
        }

        const shouldUpdate =
            existing.description !== item.description ||
            existing.price !== item.price ||
            existing.category !== item.category ||
            existing.value !== item.value ||
            existing.icon !== item.icon;

        if (shouldUpdate) {
            await prisma.shopItem.update({
                where: { id: existing.id },
                data: item
            });
        }
    }
}

export async function getCosmeticCatalog(userId?: string) {
    try {
        await ensureDefaultCosmeticShopItems();

        const items = await prisma.shopItem.findMany({
            where: { category: "cosmetics" },
            orderBy: [
                { type: "asc" },
                { price: "asc" },
                { name: "asc" }
            ]
        });

        let ownedItemIds = new Set<string>();
        let userEquipment = {
            equippedFrame: null as string | null,
            equippedBackground: null as string | null
        };

        if (userId) {
            const [inventory, user] = await Promise.all([
                prisma.userInventory.findMany({
                    where: { userId },
                    select: { shopItemId: true }
                }),
                prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        equippedFrame: true,
                        equippedBackground: true
                    }
                })
            ]);

            ownedItemIds = new Set(inventory.map((item) => item.shopItemId));
            userEquipment = {
                equippedFrame: user?.equippedFrame || null,
                equippedBackground: user?.equippedBackground || null
            };
        }

        return items.map((item) => ({
            id: item.id,
            kind: "cosmetic" as const,
            slug: getCosmeticShopSlug(item.name),
            title: item.name,
            description: item.description || "",
            category: item.type,
            type: item.type,
            collection: "COSMETIC",
            coverImage: item.icon || null,
            icon: item.icon || null,
            value: item.value || "",
            currency: "RUNES",
            price: item.price,
            priceRunes: item.price,
            owned: ownedItemIds.has(item.id),
            equipped: isEquippedItem(item.type as "FRAME" | "BACKGROUND", item.value, userEquipment),
            customizable: item.value === "custom-color" || item.value === "custom-image",
            customizationHint: item.value === "custom-color"
                ? "Warna bisa di-custom dari tab Inventory setelah item di-equip."
                : item.value === "custom-image"
                    ? "Upload gambar sendiri dari tab Inventory setelah item dibeli."
                    : null
        }));
    } catch (error) {
        console.error("Error fetching cosmetic catalog:", error);
        return [];
    }
}

export async function purchaseShopItemWithRunes(userId: string, shopItemId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await ensureDefaultCosmeticShopItems();

        const [item, user, existingOwnership] = await Promise.all([
            prisma.shopItem.findUnique({
                where: { id: shopItemId }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    points: true,
                    username: true
                }
            }),
            prisma.userInventory.findFirst({
                where: {
                    userId,
                    shopItemId
                }
            })
        ]);

        if (!item || item.category !== "cosmetics") {
            return { success: false, error: "Item kosmetik tidak ditemukan" };
        }

        if (!user || user.points < item.price) {
            return { success: false, error: "Rune tidak mencukupi" };
        }

        if (existingOwnership) {
            return { success: false, error: "Item ini sudah kamu miliki" };
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    points: { decrement: item.price }
                }
            });

            await tx.userInventory.create({
                data: {
                    userId,
                    shopItemId
                }
            });
        });

        revalidateInventorySurfaces(user.username);

        trackFirstShopPurchase(userId).catch((trackingError) => {
            console.error("Failed to track first shop purchase:", trackingError);
        });
        trackShopCompletion(userId).catch((trackingError) => {
            console.error("Failed to track shop completion:", trackingError);
        });

        return {
            success: true,
            price: item.price,
            type: item.type,
            value: item.value
        };
    } catch (error) {
        console.error("Failed to purchase shop item:", error);
        return { success: false, error: "Transaksi gagal" };
    }
}

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

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        revalidateInventorySurfaces(user?.username);

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

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        revalidateInventorySurfaces(user?.username);
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

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        revalidateInventorySurfaces(user?.username);
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

