import PartnerForm from "@/components/Admin/PartnerForm";
import { getPartnerById } from "@/lib/actions/partner.actions";
import { notFound } from "next/navigation";

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: partner } = await getPartnerById(id);

    if (!partner) {
        return notFound();
    }

    return (
        <PartnerForm partner={partner} isEdit />
    );
}
