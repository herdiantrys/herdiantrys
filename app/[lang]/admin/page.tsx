import {
    Activity,
    ShieldCheck,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { getAdminStats } from "@/lib/actions/stats.actions";
import { getRecentActivities } from "@/lib/actions/activity.actions";
import AdminDashboardClient from "./AdminDashboardClient";
import { getDictionary } from "@/get-dictionary";

const highlightIconClass = "h-4 w-4 text-[var(--site-accent)]";

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary((lang || "en") as "en" | "id");
    const [statsRes, activities] = await Promise.all([
        getAdminStats(),
        getRecentActivities()
    ]);

    if (!statsRes.success) {
        return <div className="p-10 text-red-600 dark:text-red-400">Error loading dashboard: {statsRes.error}</div>;
    }

    const { kpis, growthData, engagement, portfolioAdoption, projectTypes } = statsRes;
    const summaryText = dict.adminDashboard?.system_optimal_desc?.split(".")[0]
        || "Monitoring platform growth and engagement";

    const highlights = [
        {
            label: "Tracked KPIs",
            value: String(kpis.length).padStart(2, "0"),
            icon: TrendingUp,
        },
        {
            label: "Recent Events",
            value: String(activities.length).padStart(2, "0"),
            icon: Activity,
        },
        {
            label: "Trend Points",
            value: String(growthData.length).padStart(2, "0"),
            icon: Sparkles,
        },
        {
            label: "Active Domains",
            value: String(engagement.length).padStart(2, "0"),
            icon: ShieldCheck,
        },
    ];

    return (
        <div className="relative space-y-8 pb-20">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] overflow-hidden">
                <div className="absolute left-[6%] top-4 h-48 w-48 rounded-full bg-[var(--site-secondary)]/16 blur-[110px] dark:bg-[var(--site-secondary)]/12" />
                <div className="absolute right-[8%] top-12 h-56 w-56 rounded-full bg-[var(--site-accent)]/12 blur-[130px] dark:bg-[var(--site-accent)]/14" />
                <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent dark:via-white/10" />
            </div>

            <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,246,255,0.94)_55%,rgba(230,239,251,0.94))] px-6 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(14,20,39,0.88),rgba(11,17,31,0.9)_55%,rgba(17,27,49,0.94))] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)] md:px-8 md:py-8">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.16)_42%,rgba(109,99,255,0.08)_100%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_42%,rgba(158,140,255,0.14)_100%)]" />
                <div className="absolute -left-20 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[var(--site-secondary)]/14 blur-[120px] dark:bg-[var(--site-secondary)]/8" />
                <div className="absolute -right-16 top-0 h-36 w-36 rounded-full bg-[var(--site-accent)]/12 blur-[90px] dark:bg-[var(--site-accent)]/10" />

                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--site-secondary)]/35 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur-md dark:border-[var(--site-secondary)]/20 dark:bg-white/5 dark:text-[var(--site-secondary)]">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.45)]" />
                            Admin Workspace
                        </div>

                        <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-800 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-400 sm:text-5xl">
                            {dict.nav.admin_panel || "Admin Overview"}
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-[var(--glass-text-muted)] sm:text-base">
                            {summaryText}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                {dict.adminDashboard?.highly_active || "Live System"}
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-950/[0.03] px-4 py-2 text-xs font-semibold text-slate-600 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                                <Sparkles className="h-3.5 w-3.5 text-[var(--site-accent)]" />
                                {growthData.length} trend points ready
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[24rem]">
                        {highlights.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="rounded-[1.5rem] border border-white/70 bg-white/60 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                        {label}
                                    </p>
                                    <div className="rounded-xl border border-[var(--site-secondary)]/25 bg-[var(--site-secondary)]/12 p-2">
                                        <Icon className={highlightIconClass} />
                                    </div>
                                </div>
                                <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <AdminDashboardClient
                dict={dict}
                kpis={kpis}
                growthData={growthData}
                engagement={engagement}
                activities={activities}
                portfolioAdoption={portfolioAdoption}
                projectTypes={projectTypes}
            />
        </div>
    );
}
