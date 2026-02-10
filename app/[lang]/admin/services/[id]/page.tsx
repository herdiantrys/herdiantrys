import { notFound } from "next/navigation";
import ServiceForm from "@/components/Admin/ServiceForm";
import { getServiceById } from "@/lib/actions/service.actions";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { success, data } = await getServiceById(id);

    if (!success || !data) {
        notFound();
    }

    return (
        <ServiceForm isEdit={true} service={data} />
    );
}
