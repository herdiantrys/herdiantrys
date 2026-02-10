import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShopEditForm from "@/components/Admin/AdminShopEditForm";

export default async function AdminShopEditPage({ params }: { params: Promise<{ itemId: string }> }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Check admin role
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/dashboard");
    }

    const { itemId } = await params;

    const item = await prisma.shopItem.findUnique({
        where: { id: itemId }
    });

    if (!item) notFound();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Edit Shop Item</h1>
            <AdminShopEditForm item={item} userId={session.user.id} />
        </div>
    );
}
