import { getSanityProjects } from "@/lib/sanityProjects";
import WorksExplorer from "@/components/WorksExplorer";
import WorksHero from "@/components/WorksHero";
import { getDictionary } from "@/get-dictionary";
import { auth } from "@/auth";

import { urlFor } from "@/sanity/lib/image";

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = await params;
    const session = await auth();
    const projects = await getSanityProjects(session?.user?.id, false);
    const lang = (langParam || 'en') as "en" | "id";
    const dict = await getDictionary(lang);

    // Pick a random project image for the hero background
    let bgImage = undefined;
    if (projects && projects.length > 0) {
        // Filter projects that actually have an image
        const projectsWithImages = projects.filter((p: any) => p.image);
        if (projectsWithImages.length > 0) {
            const randomProject = projectsWithImages[Math.floor(Math.random() * projectsWithImages.length)];
            try {
                // Determine if it's a string URL or a Sanity Image Object
                if (typeof randomProject.image === 'string') {
                    bgImage = randomProject.image;
                } else if (randomProject.image && typeof randomProject.image === 'object' && (randomProject.image as any).asset) {
                    bgImage = urlFor(randomProject.image).url();
                } else if ((randomProject as any).imageUrl) {
                    bgImage = (randomProject as any).imageUrl;
                }
            } catch (e) {
                console.error("Error resolving random hero image:", e);
            }
        }
    }

    // TODO: Implement bookmarks in Prisma schema
    // For now, return empty array to prevent Sanity API errors
    const bookmarkedIds: string[] = [];

    return (
        <main className="min-h-screen relative overflow-hidden pt-28">
            <WorksHero dict={dict} projectCount={projects.length} bgImage={bgImage} />

            <div className="pb-12 container mx-auto px-0 relative z-10 w-full max-w-none">
                <WorksExplorer projects={projects as any[]} dict={dict} initialBookmarkedIds={bookmarkedIds} />
            </div>
        </main>
    );
}
