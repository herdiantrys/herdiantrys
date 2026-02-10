import prisma from "@/lib/prisma";
import { Users, FileText, Briefcase, ShoppingBag, FolderOpen } from "lucide-react";

async function getStats() {
    const [userCount, projectCount, postCount, serviceCount, shopItemCount] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.post.count(),
        prisma.service.count(),
        prisma.shopItem.count(),
    ]);

    return [
        { label: "Total Users", value: userCount, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Projects", value: projectCount, icon: FolderOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Posts", value: postCount, icon: FileText, color: "text-green-400", bg: "bg-green-400/10" },
        { label: "Services", value: serviceCount, icon: Briefcase, color: "text-orange-400", bg: "bg-orange-400/10" },
        { label: "Shop Items", value: shopItemCount, icon: ShoppingBag, color: "text-pink-400", bg: "bg-pink-400/10" },
    ];
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
                            <div>
                                <p className="text-[var(--glass-text-muted)] text-sm font-medium mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-[var(--glass-text)]">{stat.value}</h3>
                            </div>
                            <div className={`p-4 rounded-xl ${stat.bg}`}>
                                <Icon size={24} className={stat.color} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Placeholder for recent activity or charts */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-6 rounded-2xl h-64 flex items-center justify-center text-[var(--glass-text-muted)] border-dashed border-2 border-[var(--glass-border)]">
                    Chart Placeholder
                </div>
                <div className="glass p-6 rounded-2xl h-64 flex items-center justify-center text-[var(--glass-text-muted)] border-dashed border-2 border-[var(--glass-border)]">
                    Recent Activity Placeholder
                </div>
            </div>
        </div>
    );
}
