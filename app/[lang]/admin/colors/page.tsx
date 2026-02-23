import AdminColorsClient from "@/components/Admin/AdminColorsClient";
import prisma from "@/lib/prisma";

export default async function AdminColorsPage() {
    const colors = await prisma.appColor.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <AdminColorsClient initialColors={colors} />;
}
