import prisma from "@/lib/prisma";
import { getDigitalProducts } from "@/lib/actions/digital-product.actions";
import AdminDigitalProductsClient from "@/components/Admin/AdminDigitalProductsClient";

export default async function AdminDigitalProductsPage() {
    const products = await getDigitalProducts(true);

    return <AdminDigitalProductsClient initialProducts={products} />;
}
