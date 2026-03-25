import { auth } from "@/auth";
import { getDigitalProducts } from "@/lib/actions/digital-product.actions";
import { getCosmeticCatalog } from "@/lib/actions/inventory.actions";
import DigitalProductsClient from "@/components/DigitalProducts/DigitalProductsClient";
import prisma from "@/lib/prisma";

export default async function DigitalProductsPage() {
    const session = await auth();
    const userId = session?.user?.id;

    const [digitalProducts, cosmeticProducts, userData] = await Promise.all([
        getDigitalProducts(),
        getCosmeticCatalog(userId),
        userId
            ? prisma.user.findUnique({
                where: { id: userId },
                select: {
                    points: true,
                    username: true
                }
            })
            : Promise.resolve(null)
    ]);

    const products = [
        ...cosmeticProducts,
        ...digitalProducts.map((product) => ({
            ...product,
            kind: "digital" as const,
            collection: "DIGITAL",
            priceRunes: 0,
            priceIdr: product.price,
            owned: false,
            equipped: false,
            customizable: false,
        }))
    ];

    return (
        <DigitalProductsClient
            products={products}
            currentUserId={userId}
            currentUsername={userData?.username || undefined}
            initialUserPoints={userData?.points || 0}
        />
    );
}
