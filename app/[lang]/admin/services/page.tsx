import prisma from "@/lib/prisma";
import AdminServicesClient from "@/components/Admin/AdminServicesClient";

export default async function AdminServicesPage() {
    const services = await prisma.service.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <AdminServicesClient services={services} />
    );
}
