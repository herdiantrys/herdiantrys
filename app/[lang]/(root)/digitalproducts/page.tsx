import { getDigitalProducts } from "@/lib/actions/digital-product.actions";
import DigitalProductsClient from "@/components/DigitalProducts/DigitalProductsClient";

export default async function DigitalProductsPage() {
    const products = await getDigitalProducts();

    return <DigitalProductsClient products={products} />;
}
