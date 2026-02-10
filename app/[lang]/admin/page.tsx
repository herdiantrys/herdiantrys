import prisma from "@/lib/prisma";
import { Users, FileText, Briefcase, ShoppingBag, FolderOpen, TrendingUp, Activity, MessageSquare, Eye, ArrowUpRight } from "lucide-react";
import { getAdminStats } from "@/lib/actions/stats.actions";
import { getRecentActivities } from "@/lib/actions/activity.actions";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
    const [statsRes, activities] = await Promise.all([
        getAdminStats(),
        getRecentActivities()
    ]);

    if (!statsRes.success) {
        return <div className="p-10 text-red-400">Error loading dashboard: {statsRes.error}</div>;
    }

    const { kpis, growthData, engagement } = statsRes;

    return (
        <div className="space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 drop-shadow-sm">
                        Admin Overview
                    </h1>
                    <p className="text-[var(--glass-text-muted)] mt-2 font-medium">Monitoring platform growth and engagement</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Live System</span>
                    </div>
                </div>
            </div>

            <AdminDashboardClient
                kpis={kpis}
                growthData={growthData}
                engagement={engagement}
                activities={activities}
            />
        </div>
    );
}
