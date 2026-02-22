"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, FileText, Briefcase, ShoppingBag, FolderOpen, TrendingUp, Activity, MessageSquare, Eye, ArrowUpRight, Clock, UserPlus, Image as ImageIcon, Video, Star } from "lucide-react";
import { Activity as ActivityType } from "@/lib/actions/activity.actions";
import AdminAnalyticsClient from "@/components/Admin/AdminAnalyticsClient";
import { getGrowthStats, GrowthData, EngagementData } from "@/lib/actions/stats.actions";
import { formatDistanceToNow } from "date-fns";

type KPIData = {
    label: string;
    value: number;
    trend: string;
    color: string;
};

// -------------------------------------------------------------
// Interactive Card Wrapper (Liquid Glass Style - Light/Dark)
// -------------------------------------------------------------
const WidgetCard = ({ children, delay = 0, interactive = true, className = "", href }: { children: React.ReactNode, delay?: number, interactive?: boolean, className?: string, href?: string }) => {
    const CardContent = (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
            className={`relative bg-[var(--site-primary)]/40 dark:bg-black/20 backdrop-blur-2xl rounded-[2.5rem] p-6 lg:p-8 overflow-hidden 
                       border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                       flex flex-col group
                       ${interactive ? 'cursor-pointer hover:bg-[var(--site-primary)]/50 dark:hover:bg-black/30 hover:-translate-y-1' : ''} transition-all duration-500 ${className}`}
        >
            {/* Soft inner glow */}
            <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] dark:shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full w-full">
                {children}
            </div>
        </motion.div>
    );

    if (href) {
        return <Link href={href} className="flex flex-col h-full group">{CardContent}</Link>;
    }

    return CardContent;
};

// -------------------------------------------------------------
// Small KPI Widget
// -------------------------------------------------------------
function KPICard({ kpi, delay, dict }: { kpi: KPIData, delay: number, dict: any }) {
    const params = useParams();
    const lang = params?.lang || "en";

    let href = "#";
    const label = kpi.label.toLowerCase();
    if (label.includes("user")) href = `/${lang}/admin/users`;
    else if (label.includes("project")) href = `/${lang}/admin/projects`;
    else if (label.includes("post")) href = `/${lang}/admin/posts`;
    else if (label.includes("engagement")) href = `/${lang}/admin/comments`;

    return (
        <WidgetCard delay={delay} className="p-5 lg:p-6 group/kpi" href={href}>
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] group-hover/kpi:text-gray-800 dark:group-hover/kpi:text-white/90 transition-colors">{dict?.adminDashboard?.kpis?.[kpi.label.toLowerCase().replace(/ /g, '_')] || kpi.label}</p>
                <span className="text-[10px] font-bold text-[var(--site-secondary)] bg-white/50 dark:bg-white/10 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md">
                    <TrendingUp size={10} /> {kpi.trend}
                </span>
            </div>
            <h3 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight group-hover/kpi:text-[var(--site-secondary)] transition-colors">
                {kpi.value.toLocaleString()}
            </h3>
            <div className="mt-6 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 group-hover/kpi:text-[var(--site-secondary)] transition-colors uppercase tracking-widest">{href !== "#" ? (dict?.adminDashboard?.kpis?.view_details || "View Details") : (dict?.adminDashboard?.kpis?.view_analytics || "View Analytics")}</span>
                <ArrowUpRight size={12} className="text-gray-300 dark:text-gray-600 group-hover/kpi:text-[var(--site-secondary)] group-hover/kpi:translate-x-0.5 group-hover/kpi:-translate-y-0.5 transition-all" />
            </div>
        </WidgetCard>
    );
}

// -------------------------------------------------------------
// Area Chart Widget (Platform Growth)
// -------------------------------------------------------------
function AreaChartCard({ growthData: initialGrowthData, dict }: { growthData: GrowthData[], dict: any }) {
    const [timeRange, setTimeRange] = useState<"year" | "month" | "day" | "hour">("month");
    const [data, setData] = useState(initialGrowthData);
    const [isLoading, setIsLoading] = useState(false);

    const handleRangeChange = async (range: "year" | "month" | "day" | "hour") => {
        if (range === timeRange) return;
        setIsLoading(true);
        setTimeRange(range);
        const res = await getGrowthStats(range);
        if (res.success) {
            setData(res.data);
        }
        setIsLoading(false);
    };

    // Generate curved path points dynamically from real database growth data
    // Assuming aspect width 600, height 200 for calculation
    const points = data.map((d, i) => {
        const x = (i / (Math.max(1, data.length - 1))) * 600;
        // Max value scale reference
        const maxVal = Math.max(...data.map(g => g.users + g.projects), 10);
        const y = 200 - (((d.users + d.projects) / maxVal) * 160); // max height proportion
        return `${x},${y}`;
    }).join(" ");

    const polygonPoints = `0,200 ${points} 600,200`;

    return (
        <WidgetCard delay={0.6} className="col-span-1 lg:col-span-2 min-h-[350px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">{dict?.adminDashboard?.platform_growth || "Platform Growth"}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                        {dict?.adminDashboard?.new_users_vs_projects || "New users vs projects (last"}
                        {timeRange === 'year' ? ' 5 years' : timeRange === 'month' ? ' 6 months' : timeRange === 'day' ? ' 7 days' : ' 24 hours'})
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/50 dark:bg-black/20 p-1 rounded-xl shadow-sm backdrop-blur-md">
                        {['hour', 'day', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => handleRangeChange(range as any)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${timeRange === range ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 hidden lg:flex">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--site-secondary)] shadow-sm" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{dict?.adminDashboard?.combined_growth || "Combined Growth"}</span>
                    </div>
                </div>
            </div>

            <div className="relative mt-4 h-full flex flex-col justify-end w-full">
                <div className="absolute inset-x-[-1.5rem] bottom-8 h-48 pointer-events-none">
                    <svg className={`w-full h-full overflow-visible transition-opacity duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100 blur-none'}`} viewBox="0 0 600 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--site-secondary)" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="var(--site-secondary)" stopOpacity="0.0" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Background Grids */}
                        <line x1="0" y1="0" x2="600" y2="0" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="1" />
                        <line x1="0" y1="100" x2="600" y2="100" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="1" />
                        <line x1="0" y1="200" x2="600" y2="200" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="1" />

                        {/* Animated Area */}
                        <motion.polygon
                            points={polygonPoints}
                            fill="url(#area-grad)"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        />
                        {/* Animated Line */}
                        <motion.polyline
                            points={points}
                            fill="none"
                            stroke="var(--site-secondary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        />
                    </svg>
                </div>

                <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-auto z-20 px-2 lg:px-8">
                    {data.map((d, index) => <span key={d.month + index}>{d.month}</span>)}
                </div>
            </div>
        </WidgetCard>
    );
}

// -------------------------------------------------------------
// Engagement Bar Chart Widget (Category Health)
// -------------------------------------------------------------
function EngagementBarCard({ engagement, dict }: { engagement: EngagementData[], dict: any }) {
    const params = useParams();
    const lang = params?.lang || "en";

    const getLinkForSubject = (subject: string) => {
        const lower = subject.toLowerCase();
        if (lower.includes("post")) return `/${lang}/admin/posts`;
        if (lower.includes("comment")) return `/${lang}/admin/comments`;
        if (lower.includes("project")) return `/${lang}/admin/projects`;
        if (lower.includes("user")) return `/${lang}/admin/users`;
        if (lower.includes("message")) return `/${lang}/admin/contacts`;
        return "#";
    };

    return (
        <WidgetCard delay={0.7} className="col-span-1 min-h-[350px]">
            <h3 className="text-xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">{dict?.adminDashboard?.category_health || "Category Health"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 tracking-wide">{dict?.adminDashboard?.interaction_balance || "Interaction balance across domains"}</p>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
                {engagement.map((item, i) => {
                    const percentage = Math.round((item.value / (item.fullMark || 1)) * 100);
                    return (
                        <Link href={getLinkForSubject(item.subject)} key={item.subject} className="block space-y-2 group/bar cursor-pointer">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-gray-500 dark:text-gray-400 group-hover/bar:text-gray-900 dark:group-hover/bar:text-white transition-colors">{dict?.adminDashboard?.kpis?.[item.subject.toLowerCase()] || item.subject}</span>
                                <span className="text-[var(--site-secondary)] font-mono">{percentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.1, type: "spring", stiffness: 50 }}
                                    className="h-full rounded-full relative bg-[var(--site-secondary)] transition-all"
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center gap-4">
                <div className="p-3 bg-[color-mix(in_srgb,var(--site-secondary)_10%,transparent)] rounded-2xl">
                    <Activity size={20} className="text-[var(--site-secondary)] animate-pulse" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{dict?.adminDashboard?.status || "Status"}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white tracking-wide">{dict?.adminDashboard?.highly_active || "Highly Active"}</p>
                </div>
            </div>
        </WidgetCard>
    );
}

// -------------------------------------------------------------
// Live Activity Feed Widget
// -------------------------------------------------------------
function ActivityFeedCard({ activities, dict }: { activities: ActivityType[], dict: any }) {
    const params = useParams();
    const lang = params?.lang || "en";

    return (
        <WidgetCard delay={0.8} className="col-span-1 min-h-[350px]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">{dict?.adminDashboard?.live_activity || "Live Activity"}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">{dict?.adminDashboard?.real_time_pulse || "Real-time engagement pulse"}</p>
                </div>
                <Link href={`/${lang}/admin/notifications`} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--site-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm inline-block">
                    {dict?.adminDashboard?.see_all || "See All"}
                </Link>
            </div>

            <div className="space-y-6">
                {activities.slice(0, 5).map((activity, i) => (
                    <div key={activity.id} className="flex items-center gap-4 group/item cursor-pointer">
                        <div className="relative">
                            {activity.actor.image ? (
                                <img src={activity.actor.image} className="w-12 h-12 rounded-2xl object-cover border border-white/50 dark:border-white/10 opacity-80 group-hover/item:opacity-100 group-hover/item:scale-105 transition-all shadow-sm" alt={activity.actor.name} />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 transition-all shadow-sm">
                                    {activity.actor.name[0]}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 p-1 bg-white/80 dark:bg-black/50 rounded-lg shadow-sm backdrop-blur-md">
                                {getActivityIcon(activity.type)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white/90 group-hover/item:text-[var(--site-secondary)] transition-colors truncate">
                                {activity.actor.name} <span className="text-gray-400 dark:text-gray-500 font-medium text-xs">/ @{activity.actor.username}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 tracking-wide">{activity.details.description || activity.details.title}</p>
                        </div>
                        <div className="text-[10px] font-bold text-gray-300 dark:text-white/20 whitespace-nowrap font-mono group-hover/item:text-gray-500 dark:group-hover/item:text-white/40 transition-colors">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </div>
                    </div>
                ))}
            </div>
        </WidgetCard>
    );
}

function getActivityIcon(type: string) {
    switch (type) {
        case "new_user": return <UserPlus size={12} className="text-[var(--site-secondary)]" />;
        case "new_project": return <FolderOpen size={12} className="text-gray-500 dark:text-gray-400" />;
        case "user_post": return <MessageSquare size={12} className="text-[var(--site-secondary)]" />;
        default: return <Clock size={12} className="text-gray-400 dark:text-gray-500" />;
    }
}

// -------------------------------------------------------------
// System Insights Card (Combining Liquid Wave radar aesthetic)
// -------------------------------------------------------------
function SystemInsightsCard({ dict }: { dict: any }) {
    return (
        <WidgetCard delay={0.9} className="col-span-1 min-h-[350px] flex flex-col justify-center items-center text-center overflow-hidden">
            {/* Soft Ambient Light */}
            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[var(--site-secondary)] blur-[80px]" />
            </div>

            <div className="w-20 h-20 mx-auto bg-white/50 dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-md group-hover:scale-105 transition-all duration-700 z-10 mb-6 border border-white/50 dark:border-white/10">
                <Activity size={32} className="text-[var(--site-secondary)]" />
            </div>

            <h3 className="text-2xl font-light text-gray-900 dark:text-white tracking-tight z-10">{dict?.adminDashboard?.advanced_insights || "Advanced Insights"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-4 leading-relaxed z-10 font-medium tracking-wide">
                {dict?.adminDashboard?.system_optimal_desc || "System is performing optimally. Database latency is within limits and platform engagement is trending upward."}
            </p>
        </WidgetCard>
    );
}

// -------------------------------------------------------------
// New Widget: Portfolio Feature Adoption (Circular Gauge)
// -------------------------------------------------------------
function PortfolioAdoptionCard({ data, dict }: { data: { active: number, total: number }, dict: any }) {
    const percentage = data.total > 0 ? Math.round((data.active / data.total) * 100) : 0;
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        const controls = animate(0, percentage, {
            duration: 2,
            ease: "easeOut",
            onUpdate(value) {
                setDisplayVal(Math.round(value));
            }
        });
        return controls.stop;
    }, [percentage]);

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <WidgetCard delay={0.75} className="col-span-1 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden group/gauge">
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none blur-[60px] opacity-10"
                style={{ background: 'var(--site-secondary)' }}
            />

            <div className="text-center mb-6 z-10 w-full flex justify-between items-start px-2">
                <div className="text-left">
                    <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">{dict?.adminDashboard?.feature_adoption || "Feature Adoption"}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">{dict?.adminDashboard?.custom_portfolios_active || "Custom Portfolios Active"}</p>
                </div>
                <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl shadow-sm backdrop-blur-md">
                    <Star size={18} className="text-[var(--site-secondary)]" />
                </div>
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center z-10 mt-auto mb-auto">
                <svg className="w-full h-full transform -rotate-90">
                    <defs>
                        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="var(--site-secondary)" />
                            <stop offset="100%" stopColor="var(--site-secondary)" />
                        </linearGradient>
                        <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <circle
                        cx="96" cy="96" r={radius}
                        fill="none"
                        className="stroke-black/5 dark:stroke-white/5"
                        strokeWidth="10"
                    />
                    <motion.circle
                        cx="96" cy="96" r={radius}
                        fill="none"
                        stroke="url(#gauge-grad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        filter="url(#gauge-glow)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-light text-gray-900 dark:text-white tracking-tight tabular-nums">{displayVal}%</span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                        {data.active} / {data.total} {dict?.adminDashboard?.users || "Users"}
                    </span>
                </div>
            </div>

            <div className="w-full mt-auto pt-6 border-t border-black/5 dark:border-white/5 flex justify-between items-center z-10">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{dict?.adminDashboard?.adoption_rate || "Adoption Rate"}</span>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--site-secondary)] animate-pulse" />
                    <span className="text-xs font-black text-[var(--site-secondary)]">{dict?.adminDashboard?.growing || "Growing"}</span>
                </div>
            </div>
        </WidgetCard>
    );
}

// -------------------------------------------------------------
// New Widget: Content Format Distribution (Split Neon Bar)
// -------------------------------------------------------------
function ContentDistributionCard({ data, dict }: { data: { image: number, video: number }, dict: any }) {
    const total = data.image + data.video || 1;
    const imagePct = (data.image / total) * 100;
    const videoPct = (data.video / total) * 100;

    return (
        <WidgetCard delay={0.8} className="col-span-1 min-h-[350px] flex flex-col">
            <div className="flex justify-between items-start mb-auto">
                <div>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">{dict?.adminDashboard?.content_delivery || "Content Delivery"}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">{dict?.adminDashboard?.project_formats || "Project formats hosted"}</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center py-8">
                {/* Visual Ratio Bar */}
                <div className="h-6 w-full rounded-full flex overflow-hidden shadow-sm relative bg-black/5 dark:bg-white/5 group/split cursor-pointer border border-white/50 dark:border-white/10">

                    {/* Image Section (Secondary) */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${imagePct}%` }}
                        transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
                        className="h-full relative group-hover/split:brightness-110 transition-all border-r-2 border-white/50 dark:border-black/50"
                        style={{ background: 'var(--site-secondary)' }}
                    >
                    </motion.div>

                    {/* Video Section (Primary) */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${videoPct}%` }}
                        transition={{ duration: 1.5, type: "spring", bounce: 0.2, delay: 0.2 }}
                        className="h-full relative group-hover/split:brightness-110 transition-all bg-black/10 dark:bg-white/10"
                    >
                    </motion.div>
                </div>

                {/* Legends */}
                <div className="flex justify-between mt-8">
                    <div className="flex items-center gap-3 text-left">
                        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-[var(--site-secondary)] shadow-sm backdrop-blur-md">
                            <ImageIcon size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-light text-gray-900 dark:text-white tracking-tight">{Math.round(imagePct)}% <span className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1">{dict?.adminDashboard?.images || "IMAGES"}</span></p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[80px]">{data.image.toLocaleString()} {dict?.adminDashboard?.total || "total"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                        <div>
                            <p className="text-sm font-light text-gray-900 dark:text-white tracking-tight"><span className="text-xs font-bold text-gray-400 dark:text-gray-500 mr-1">{dict?.adminDashboard?.videos || "VIDEOS"}</span>{Math.round(videoPct)}%</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[80px]">{data.video.toLocaleString()} {dict?.adminDashboard?.total || "total"}</p>
                        </div>
                        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-gray-500 dark:text-gray-400 shadow-sm backdrop-blur-md">
                            <Video size={16} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">{dict?.adminDashboard?.storage_impact || "Storage Impact Analyzer"}</p>
            </div>
        </WidgetCard>
    );
}

// -------------------------------------------------------------
// Main Dashboard Export
// -------------------------------------------------------------
export default function AdminDashboardClient({
    dict,
    kpis,
    growthData,
    engagement,
    activities,
    portfolioAdoption,
    projectTypes
}: {
    kpis: KPIData[];
    growthData: GrowthData[];
    engagement: EngagementData[];
    activities: ActivityType[];
    portfolioAdoption: { active: number; total: number };
    projectTypes: { image: number; video: number };
    dict?: any;
}) {
    return (
        <div className="pb-10 pt-4 relative">

            <AdminAnalyticsClient dict={dict} />

            {/* 1. KPIs Top Row (5 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {kpis.map((kpi, idx) => (
                    <KPICard key={kpi.label} kpi={kpi} delay={idx * 0.1} dict={dict} />
                ))}
            </div>

            {/* 2. Main Visualizations Grid (3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
                <AreaChartCard growthData={growthData} dict={dict} />
                <EngagementBarCard engagement={engagement} dict={dict} />
            </div>

            {/* NEW 3. Middle Analysis Row (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                <PortfolioAdoptionCard data={portfolioAdoption} dict={dict} />
                <ContentDistributionCard data={projectTypes} dict={dict} />
            </div>

            {/* 4. Bottom Feeds (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
                <ActivityFeedCard activities={activities} dict={dict} />
                <SystemInsightsCard dict={dict} />
            </div>
        </div>
    );
}
