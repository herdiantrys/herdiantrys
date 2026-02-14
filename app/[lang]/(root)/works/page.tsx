import { getSanityProjects } from "@/lib/sanityProjects";
import WorksExplorer from "@/components/WorksExplorer";
import WorksHero from "@/components/WorksHero";
import { getDictionary } from "@/get-dictionary";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";


export default async function WorksPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = await params;
    const session = await auth();
    const projects = await getSanityProjects(session?.user?.id, false);
    const lang = (langParam || 'en') as "en" | "id";
    const dict = await getDictionary(lang);

    // Fetch user bookmarks for grid state
    let bookmarkedIds: string[] = [];
    if (session?.user?.id) {
        const user = await client.fetch(defineQuery(`*[_type == "user" && _id == $userId][0] { bookmarks }`), { userId: session.user.id });
        if (user?.bookmarks) {
            bookmarkedIds = user.bookmarks.map((b: any) => b._ref);
        }
    }

    return (
        <main className="min-h-screen relative overflow-hidden pt-28">
            <WorksHero dict={dict} projectCount={projects.length} />

            <div className="pb-12 container mx-auto px-0 relative z-10 w-full max-w-none">
                <WorksExplorer projects={projects as any[]} dict={dict} initialBookmarkedIds={bookmarkedIds} />
            </div>
        </main>
    );
}
