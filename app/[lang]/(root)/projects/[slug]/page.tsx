import { getSanityProject } from "@/lib/sanityProjects"; // Updated import
import { incrementViews } from "./actions";
import ProjectDetail from "@/components/ProjectDetail";
import { notFound } from "next/navigation";
import { getDictionary } from "@/get-dictionary";
import { auth } from "@/auth";
import { checkIsBookmarked } from "@/lib/actions/bookmark.actions";
import ProjectXPHandler from "@/components/Gamification/ProjectXPHandler";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectPage({ params }: { params: Promise<{ lang: string, slug: string }> }) {
    const { slug, lang } = await params;
    const session = await auth();

    // Fetch dictionary
    const dict = await getDictionary((lang || 'en') as "en" | "id");

    // Fetch project data by slug (using Prisma now)
    const project = await getSanityProject(slug, session?.user?.id);

    if (!project) {
        return notFound();
    }

    // Check if bookmarked
    let isBookmarked = false;
    if (session?.user?.id) {
        isBookmarked = await checkIsBookmarked(session.user.id, project.id); // project.id (Prisma) vs project._id (Sanity)
    }

    return (
        <div className="pt-[75px]">
            <ProjectDetail project={project as any} dict={dict} initialIsBookmarked={isBookmarked} />
            {session?.user?.id && <ProjectXPHandler userId={session.user.id} projectId={project.id} />}
        </div>
    );
}
