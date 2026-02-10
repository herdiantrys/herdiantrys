import prisma from "@/lib/prisma";
import AdminShopClient from "@/components/Admin/AdminShopClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminShopPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const items = await prisma.shopItem.findMany({
        orderBy: { price: 'asc' }
    });

    const safeItems = items.map(item => ({
        ...item,
        // @ts-ignore
        category: (item as any).category || 'cosmetics' // Fallback for old items or type glitch
    }));

    return (
        <div>
            <AdminShopClient items={safeItems} currentUserId={session.user.id} />
        </div>
    );
}
