import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface RelatedProject {
    id: string;
    title: string;
    slug: string;
    image: string;
    category: string;
}

export default function RelatedProjects({ projects }: { projects: RelatedProject[] }) {
    if (!projects || projects.length === 0) return null;

    return (
        <div className="pt-20 border-t border-[var(--glass-border)]">
            <h3 className="text-2xl font-bold text-[var(--glass-text)] mb-8 flex items-center gap-3">
                <span>More like this</span>
                <ArrowRight size={24} className="text-[var(--glass-text-muted)]" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Link href={`/projects/${project.slug}`} key={project.id} className="group relative aspect-video rounded-2xl overflow-hidden border border-[var(--glass-border)]">
                        <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                            <span className="text-xs font-semibold text-teal-400 mb-1">{project.category}</span>
                            <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{project.title}</h4>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
