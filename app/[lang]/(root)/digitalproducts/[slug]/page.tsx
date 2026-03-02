import { getDigitalProductBySlug } from "@/lib/actions/digital-product.actions";
import DigitalProductDetailClient from "@/components/DigitalProducts/DigitalProductDetailClient";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function DigitalProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const product = await getDigitalProductBySlug(slug);

    if (!product || !product.isPublished) {
        notFound();
    }

    const session = await auth();
    let userPoints = 0;

    if (session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { points: true }
        });
        userPoints = dbUser?.points || 0;
    }

    return <DigitalProductDetailClient product={product} userId={session?.user?.id} userPoints={userPoints} />;
}
