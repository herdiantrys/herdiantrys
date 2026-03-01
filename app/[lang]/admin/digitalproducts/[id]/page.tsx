import prisma from "@/lib/prisma";
import AdminDigitalProductForm from "@/components/Admin/AdminDigitalProductForm";
import { notFound } from "next/navigation";

export default async function EditDigitalProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.digitalProduct.findUnique({
        where: { id }
    });

    if (!product) {
        notFound();
    }

    return <AdminDigitalProductForm initialData={product} isEdit />;
}
