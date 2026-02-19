import prisma from "@/lib/prisma";
import AdminProjectsClient from "@/components/Admin/AdminProjectsClient";

export default async function AdminProjectsPage() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            category: true,
            author: true
        }
    });

    return <AdminProjectsClient initialProjects={projects} />;
}
