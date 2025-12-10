import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getRecentProjects, getRecentUsers, getRecentUpdates, getPopularProjects } from "@/lib/dashboard";
import Dashboard from "@/components/Dashboard";
import { getDictionary } from "@/get-dictionary";

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const [stats, recentProjects, recentUsers, recentUpdates, popularProjects] = await Promise.all([
        getDashboardStats(),
        getRecentProjects(),
        getRecentUsers(),
        getRecentUpdates(),
        getPopularProjects()
    ]);

    // Fetch dictionary
    const lang = (params.lang || 'en') as "en" | "id";
    const dict = await getDictionary(lang);

    return (
        <main className="min-h-screen relative overflow-hidden pt-28">

            <div className="pt-24 pb-12 container mx-auto px-4 relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-[var(--glass-text)] mb-2">{dict.dashboard.title}</h1>
                    <p className="text-[var(--glass-text-muted)]">{dict.dashboard.welcome}, {session.user.name}</p>
                </div>

                <Dashboard
                    stats={stats}
                    recentProjects={recentProjects}
                    recentUsers={recentUsers}
                    recentUpdates={recentUpdates}
                    popularProjects={popularProjects}
                    dict={dict}
                />
            </div>
        </main>
    );

}
