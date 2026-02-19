"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Loader2, Save, X, Image as ImageIcon } from "lucide-react";
import { createProject, updateProject, deleteProject, uploadProjectAsset } from "@/lib/actions/project.actions";
import { useRouter } from "next/navigation";

interface ProjectManagerProps {
    userId: string;
    projects: any[];
}

export default function ProjectManager({ userId, projects }: ProjectManagerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleEdit = (project: any) => {
        setCurrentProject(project);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentProject({
            title: "",
            description: "",
            content: "", // HTML content
            image: "",
            demoUrl: "",
            repoUrl: "",
            type: "IMAGE",
            status: "PUBLISHED"
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        setIsLoading(true);
        try {
            await deleteProject(id);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to delete project");
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!currentProject.title) return alert("Title is required");
        setIsLoading(true);
        try {
            // Prepare data: content is stored as JSON string or object
            // For now, let's store it as simple object { type: 'html', html: ... } to match schema expectation if json
            // or just pass it if schema allows string. Schema says Json?
            // Let's store as { html: currentProject.content }

            const projectData = {
                ...currentProject,
                content: { html: currentProject.content }
            };

            if (currentProject.id) {
                await updateProject(currentProject.id, projectData);
            } else {
                await createProject(projectData);
            }
            setIsEditing(false);
            setCurrentProject(null);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to save project");
        }
        setIsLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        formData.append("type", "image");

        try {
            const res = await uploadProjectAsset(formData);
            if (res.success) {
                setCurrentProject((prev: any) => ({ ...prev, image: res.url }));
            } else {
                alert("Upload failed: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("Upload error");
        }
        setIsLoading(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{currentProject.id ? "Edit Project" : "New Project"}</h3>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Title</label>
                        <input
                            type="text"
                            value={currentProject.title}
                            onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                            placeholder="Project Title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Slug (Auto-generated if empty)</label>
                        <input
                            type="text"
                            value={currentProject.slug || ""}
                            onChange={(e) => setCurrentProject({ ...currentProject, slug: e.target.value })}
                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                            placeholder="project-slug"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Short Description</label>
                        <textarea
                            value={currentProject.description || ""}
                            onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none h-24 resize-none"
                            placeholder="Brief summary..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Project Image</label>
                        <div className="flex items-start gap-4">
                            {currentProject.image && (
                                <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                    <Image src={currentProject.image} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                            <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl hover:bg-white/5 text-[var(--glass-text)] transition-colors">
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                                <span>Upload Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">HTML Content</label>
                        <textarea
                            value={currentProject.content?.html || currentProject.content || ""}
                            onChange={(e) => setCurrentProject({ ...currentProject, content: e.target.value })}
                            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none h-64 font-mono text-sm"
                            placeholder="<p>Write your HTML content here...</p>"
                        />
                        <p className="text-xs text-[var(--glass-text-muted)] mt-1">Supports basic HTML markup for detailed case studies.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Demo URL</label>
                            <input
                                type="url"
                                value={currentProject.demoUrl || ""}
                                onChange={(e) => setCurrentProject({ ...currentProject, demoUrl: e.target.value })}
                                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[var(--glass-text-muted)] mb-2">Repo URL</label>
                            <input
                                type="url"
                                value={currentProject.repoUrl || ""}
                                onChange={(e) => setCurrentProject({ ...currentProject, repoUrl: e.target.value })}
                                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-[var(--glass-text)] focus:border-teal-500 outline-none"
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-xl hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-400 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Project
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                    <h3 className="font-bold text-[var(--glass-text)]">Manage Projects</h3>
                    <p className="text-sm text-[var(--glass-text-muted)]">Add or edit your portfolio works</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 transition-all font-medium"
                >
                    <Plus size={16} />
                    <span>Add Project</span>
                </button>
            </div>

            <div className="space-y-3">
                {projects.length === 0 ? (
                    <div className="text-center py-8 text-[var(--glass-text-muted)] border border-dashed border-white/10 rounded-xl">
                        No projects found. Create your first one!
                    </div>
                ) : (
                    projects.map((project: any) => (
                        <div key={project.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-black/50 shrink-0">
                                {project.image ? (
                                    <Image src={project.image} alt={project.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-white/20">Img</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate text-[var(--glass-text)]">{project.title}</h4>
                                <p className="text-xs text-[var(--glass-text-muted)] truncate">{project.description}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(project)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-blue-400"
                                    title="Edit"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
