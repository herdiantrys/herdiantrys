"use client";

import { motion } from "framer-motion";
import { Users, FileText, Briefcase, ShoppingBag, FolderOpen, TrendingUp, Activity, MessageSquare, Eye, ArrowUpRight, Clock, UserPlus } from "lucide-react";
import { Activity as ActivityType } from "@/lib/actions/activity.actions";
import { GrowthData, EngagementData } from "@/lib/actions/stats.actions";
import { formatDistanceToNow } from "date-fns";

type KPIData = {
    label: string;
    value: number;
    trend: string;
    color: string;
};

export default function AdminDashboardClient({
    kpis,
    growthData,
    engagement,
    activities
}: {
    kpis: KPIData[];
    growthData: GrowthData[];
    engagement: EngagementData[];
    activities: ActivityType[];
}) {
    return (
        <div className="space-y-10">
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass p-6 rounded-3xl relative group overflow-hidden border border-white/10 hover:border-teal-500/30 transition-all duration-500"
                    >
                        {/* Background Glow */}
                        <div
                            className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000"
                            style={{ backgroundColor: kpi.color }}
                        />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[var(--glass-text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">{kpi.label}</p>
                                <span className="text-[10px] font-bold text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                                    <TrendingUp size={10} /> {kpi.trend}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-white drop-shadow-md">
                                {kpi.value.toLocaleString()}
                            </h3>
                            <div className="mt-4 flex items-center gap-2 group/link cursor-pointer">
                                <span className="text-[10px] font-bold text-white/40 group-hover/link:text-teal-400 transition-colors uppercase tracking-widest">View Analytics</span>
                                <ArrowUpRight size={12} className="text-white/20 group-hover/link:text-teal-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 glass rounded-[32px] p-8 border border-white/10 relative overflow-hidden group"
                >
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-white">Platform Growth</h3>
                            <p className="text-xs text-[var(--glass-text-muted)] font-medium">New users vs projects (last 6 months)</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-teal-500" />
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Projects</span>
                            </div>
                        </div>
                    </div>

                    {/* Custom SVG Line Chart */}
                    <div className="h-64 relative flex items-end justify-between px-2">
                        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                            {/* Grids */}
                            <line x1="0" y1="0" x2="600" y2="0" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
                            <line x1="0" y1="100" x2="600" y2="100" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
                            <line x1="0" y1="200" x2="600" y2="200" stroke="white" strokeOpacity="0.05" strokeWidth="1" />

                            {/* Users Line */}
                            <motion.path
                                d={generateLinePath(growthData.map(d => d.users), 600, 200)}
                                fill="none"
                                stroke="url(#teal-grad)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                            {/* Projects Line */}
                            <motion.path
                                d={generateLinePath(growthData.map(d => d.projects), 600, 200)}
                                fill="none"
                                stroke="url(#blue-grad)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                            />

                            <defs>
                                <linearGradient id="teal-grad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#2DD4BF" />
                                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.2" />
                                </linearGradient>
                                <linearGradient id="blue-grad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {growthData.map((data, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center group/point">
                                <div className="text-[10px] font-black text-white opacity-0 group-hover/point:opacity-100 transition-opacity mb-2">{data.users}u</div>
                                <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.8)] scale-0 group-hover/point:scale-100 transition-transform" />
                                <div className="mt-4 text-[10px] font-bold text-white/40">{data.month}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Engagement Radar/Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-[32px] p-8 border border-white/10 relative overflow-hidden"
                >
                    <h3 className="text-xl font-black text-white mb-2">Category Health</h3>
                    <p className="text-xs text-[var(--glass-text-muted)] font-medium mb-8">Interaction balance across domains</p>

                    <div className="space-y-6">
                        {engagement.map((item, i) => (
                            <div key={item.subject} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white/60">{item.subject}</span>
                                    <span className="text-teal-400">{Math.round((item.value / item.fullMark) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / item.fullMark) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                        <div className="p-3 bg-teal-500/10 rounded-2xl">
                            <Activity size={20} className="text-teal-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Status</p>
                            <p className="text-sm font-bold text-white">Highly Active</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latest Activities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-[32px] p-8 border border-white/10"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white">Live Activity</h3>
                            <p className="text-xs text-[var(--glass-text-muted)] font-medium">Real-time engagement pulse</p>
                        </div>
                        <button className="glass px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">See All</button>
                    </div>

                    <div className="space-y-6">
                        {activities.slice(0, 5).map((activity, i) => (
                            <div key={activity.id} className="flex items-center gap-4 group cursor-pointer">
                                <div className="relative">
                                    {activity.actor.image ? (
                                        <img src={activity.actor.image} className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" alt={activity.actor.name} />
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white/40">
                                            {activity.actor.name[0]}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 p-1 bg-black rounded-lg border border-white/10">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                                        {activity.actor.name} <span className="text-white/40 font-medium">/ @{activity.actor.username}</span>
                                    </p>
                                    <p className="text-xs text-[var(--glass-text-muted)] mt-1 line-clamp-1">{activity.details.description || activity.details.title}</p>
                                </div>
                                <div className="text-[10px] font-bold text-white/20 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* System Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-[32px] p-8 border border-white/10 relative overflow-hidden flex flex-col justify-center items-center text-center group"
                >
                    {/* Animated Background Rays */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.05),transparent_70%)] animate-pulse" />

                    <div className="relative z-10 space-y-4">
                        <div className="w-20 h-20 mx-auto bg-teal-400/10 rounded-[30%] flex items-center justify-center border border-teal-400/20 shadow-[0_0_30px_rgba(45,212,191,0.1)] group-hover:rotate-12 transition-transform duration-700">
                            <Activity size={32} className="text-teal-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white">Advanced Insights</h3>
                        <p className="text-sm text-[var(--glass-text-muted)] max-w-xs mx-auto">
                            System is performing optimally. Database latency is within limits and engagement is trending upward.
                        </p>
                        <button className="mt-4 px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-teal-400 hover:scale-105 transition-all shadow-xl">
                            Download Report
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function getActivityIcon(type: string) {
    switch (type) {
        case "new_user": return <UserPlus size={12} className="text-blue-400" />;
        case "new_project": return <FolderOpen size={12} className="text-purple-400" />;
        case "user_post": return <MessageSquare size={12} className="text-green-400" />;
        default: return <Clock size={12} className="text-gray-400" />;
    }
}

function generateLinePath(data: number[], width: number, height: number) {
    if (data.length < 2) return "";
    const max = Math.max(...data, 10);
    const stepX = width / (data.length - 1);

    return data.reduce((path, val, i) => {
        const x = i * stepX;
        const y = height - (val / max) * height;
        return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "");
}
