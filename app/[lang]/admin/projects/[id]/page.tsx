import ProjectForm from "@/components/Admin/ProjectForm";
import { getProject } from "@/lib/actions/project.actions";
import { redirect } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getProject(id);

    if (!result.success || !result.data) {
        redirect("/admin/projects");
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Edit Project
                </h1>
                <p className="text-[var(--glass-text-muted)] mt-2">
                    Update project details and ownership.
                </p>
            </div>
            <ProjectForm initialData={result.data} />
        </div>
    );
}
