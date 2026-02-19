import { getCategories } from "@/lib/actions/category.actions";
import AdminCategoriesClient from "@/components/Admin/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
    const { data: categories } = await getCategories();

    return (
        <AdminCategoriesClient initialCategories={categories || []} />
    );
}
