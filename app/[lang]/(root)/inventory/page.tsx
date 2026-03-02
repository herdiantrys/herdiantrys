import { getUserInventory } from "@/lib/actions/inventory.actions";
import DigitalInventoryClient from "@/components/DigitalProducts/DigitalInventoryClient";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function InventoryPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { inventory = [], equippedFrame, equippedBackground, profileColor, frameColor } = await getUserInventory(session.user.id || "");

    const unifiedToFormat = (item: any) => {
        const isShopItem = ["FRAME", "BACKGROUND", "BANNER_VIDEO"].includes(item.type);
        return {
            id: item.inventoryId,
            acquiredAt: item.acquiredAt,
            product: {
                id: item.id,
                title: item.title,
                description: item.description || `Type: ${item.type}`,
                category: item.category || item.type || "ASSET",
                coverImage: item.coverImage || item.icon || null,
                fileUrl: item.fileUrl || null,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            },
            isShopItem: isShopItem,
            originalShopItem: isShopItem ? item : undefined
        };
    };

    const combinedInventory = inventory.map(unifiedToFormat);

    // Sort combined inventory by acquiredAt desc
    combinedInventory.sort((a: any, b: any) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime());

    return (
        <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-16 md:mt-0 relative min-h-[85vh]">
            <DigitalInventoryClient
                initialInventory={combinedInventory}
                equippedFrame={equippedFrame}
                equippedBackground={equippedBackground}
                profileColor={profileColor}
                frameColor={frameColor}
            />
        </main>
    );
}
