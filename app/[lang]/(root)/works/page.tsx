import { getSanityProjects } from "@/lib/sanityProjects";
import WorksExplorer from "@/components/WorksExplorer";
import WorksHero from "@/components/WorksHero";
import { getDictionary } from "@/get-dictionary";


export default async function WorksPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: langParam } = await params;
    const projects = await getSanityProjects(undefined, false);
    const lang = (langParam || 'en') as "en" | "id";
    const dict = await getDictionary(lang);

    return (
        <main className="min-h-screen relative overflow-hidden pt-28">
            <WorksHero dict={dict} projectCount={projects.length} />

            <div className="pb-12 container mx-auto px-0 relative z-10 w-full max-w-none">
                <WorksExplorer projects={projects} dict={dict} />
            </div>
        </main>
    );
}
