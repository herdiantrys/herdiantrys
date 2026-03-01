import prisma from "@/lib/prisma";
import DigitalProductsClient from "@/components/DigitalProducts/DigitalProductsClient";

export default async function DigitalProductsPage() {
    const products = await prisma.digitalProduct.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" }
    });

    return <DigitalProductsClient products={products} />;
}
