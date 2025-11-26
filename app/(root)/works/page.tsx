import { getSanityProjects } from "@/lib/sanityProjects";
import GlassPortfolio from "@/components/GlassPortfolio";


export default async function WorksPage() {
    const projects = await getSanityProjects(undefined, false);

    return (
        <main className="min-h-screen relative overflow-hidden">

            <div className="pt-24 pb-12 container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[var(--glass-text)]">
                        All Works
                    </h1>
                    <p className="text-[var(--glass-text-muted)] max-w-2xl mx-auto text-lg">
                        A comprehensive collection of my creative journey, featuring design, illustration, and videography projects.
                    </p>
                </div>

                <GlassPortfolio projects={projects} />
            </div>
        </main>
    );
}
