import prisma from "@/lib/prisma";
import AdminDigitalProductsClient from "@/components/Admin/AdminDigitalProductsClient";

export default async function AdminDigitalProductsPage() {
    const products = await prisma.digitalProduct.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <AdminDigitalProductsClient initialProducts={products} />;
}
