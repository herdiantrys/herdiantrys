import { auth } from "@/auth";
import { getSiteContent } from "@/lib/actions/content.actions";
import ContentManager from "@/components/Admin/ContentManager";
import { redirect } from "next/navigation";
import { FileText, ChevronRight, LayoutDashboard } from "lucide-react";

export default async function AdminContentPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const content = await getSiteContent();
    const skillsCount = Array.isArray(content?.skills) ? content.skills.length : 0;
    const jobsCount = Array.isArray(content?.experience) ? content.experience.length : 0;
    const degreesCount = Array.isArray(content?.education) ? content.education.length : 0;
    const socialsCount = Array.isArray(content?.socialLinks) ? content.socialLinks.length : 0;

    return (
        <div className="space-y-6">
            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium mb-3">
                        <LayoutDashboard size={12} />
                        <span>Admin</span>
                        <ChevronRight size={12} className="opacity-50" />
                        <span className="text-[var(--site-accent)] font-semibold">Content Management</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
                                Portfolio Management
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                Manage your homepage content, bio, social links, skills &amp; experience
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-sm text-center">
                        <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">{skillsCount}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Skills</p>
                    </div>
                    <div className="px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-sm text-center">
                        <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">{jobsCount}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Jobs</p>
                    </div>
                    <div className="px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-sm text-center">
                        <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">{degreesCount}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Degrees</p>
                    </div>
                    <div className="px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-sm text-center">
                        <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">{socialsCount}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Socials</p>
                    </div>
                </div>
            </div>

            <ContentManager initialData={content || {}} />
        </div>
    );
}
