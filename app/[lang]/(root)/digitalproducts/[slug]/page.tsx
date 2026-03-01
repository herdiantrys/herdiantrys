import prisma from "@/lib/prisma";
import DigitalProductDetailClient from "@/components/DigitalProducts/DigitalProductDetailClient";
import { notFound } from "next/navigation";

export default async function DigitalProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const product = await prisma.digitalProduct.findUnique({
        where: { slug }
    });

    if (!product || !product.isPublished) {
        notFound();
    }

    return <DigitalProductDetailClient product={product} />;
}
