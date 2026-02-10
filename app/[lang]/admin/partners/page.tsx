import { getPartners } from "@/lib/actions/partner.actions";
import AdminPartnersClient from "@/components/Admin/AdminPartnersClient";

export default async function AdminPartnersPage() {
    const { data: partners } = await getPartners();

    return (
        <AdminPartnersClient partners={partners || []} />
    );
}
