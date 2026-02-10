import ProjectForm from "@/components/Admin/ProjectForm";

export default function NewProjectPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Create New Project
                </h1>
                <p className="text-[var(--glass-text-muted)] mt-2">
                    Add a new project to your portfolio.
                </p>
            </div>
            <ProjectForm isNew={true} />
        </div>
    );
}
