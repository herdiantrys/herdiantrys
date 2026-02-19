import { getSanityProject } from "@/lib/sanityProjects";
import { incrementViews } from "./actions";
import ProjectDetail from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { getDictionary } from "@/get-dictionary";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectPage({ params }: { params: Promise<{ id: string, lang: string }> }) {
    const { id, lang } = await params;

    // Fetch project data using Prisma-based function
    const project = await getSanityProject(id);

    if (!project) {
        return notFound();
    }

    // Increment views
    await incrementViews(id);

    const dict = await getDictionary(lang as "en" | "id");

    return <ProjectDetail project={project as any} dict={dict} />;
}
