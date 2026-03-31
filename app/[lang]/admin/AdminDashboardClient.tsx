"use client";

import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Activity,
    ArrowUpRight,
    Clock,
    FolderOpen,
    Image as ImageIcon,
    MessageSquare,
    Star,
    TrendingUp,
    UserPlus,
    Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Activity as ActivityType } from "@/lib/actions/activity.actions";
import AdminAnalyticsClient from "@/components/Admin/AdminAnalyticsClient";
import {
    EngagementData,
    getGrowthStats,
    GrowthData,
} from "@/lib/actions/stats.actions";

type KPIData = {
    label: string;
    value: number;
    trend: string;
    color: string;
};

type AdminDashboardDictionary = {
    adminDashboard?: {
        adoption_rate?: string;
        advanced_insights?: string;
        category_health?: string;
        combined_growth?: string;
        content_delivery?: string;
        custom_portfolios_active?: string;
        feature_adoption?: string;
        growing?: string;
        highly_active?: string;
        images?: string;
        interaction_balance?: string;
        kpis?: Record<string, string | undefined>;
        live_activity?: string;
        new_users_vs_projects?: string;
        platform_growth?: string;
        project_formats?: string;
        real_time_pulse?: string;
        see_all?: string;
        status?: string;
        storage_impact?: string;
        system_optimal_desc?: string;
        total?: string;
        users?: string;
        videos?: string;
    };
};

const cardShellClass = "relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(238,245,255,0.9))] p-6 shadow-[0_18px_55px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(14,20,39,0.84),rgba(10,16,30,0.92))] dark:shadow-[0_20px_55px_rgba(0,0,0,0.42)] lg:p-8";
const cardTitleClass = "text-xl font-semibold tracking-tight text-slate-950 dark:text-white";
const cardMutedClass = "text-sm font-medium tracking-wide text-slate-600 dark:text-slate-400";
const cardLabelClass = "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500";
const cardChipClass = "inline-flex items-center gap-1.5 rounded-full border border-[var(--site-secondary)]/28 bg-[var(--site-secondary)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm dark:border-[var(--site-secondary)]/20 dark:bg-[var(--site-secondary)]/10 dark:text-[var(--site-secondary)]";
const insetPanelClass = "rounded-[1.75rem] border border-slate-200/70 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-md dark:border-white/5 dark:bg-white/[0.03] dark:shadow-none";

const WidgetCard = ({
    children,
    delay = 0,
    interactive = true,
    className = "",
    href,
}: {
    children: React.ReactNode;
    delay?: number;
    interactive?: boolean;
    className?: string;
    href?: string;
}) => {
    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay, type: "spring", stiffness: 90 }}
            className={`${cardShellClass} ${interactive ? "cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:border-slate-300/90 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.88)] dark:hover:border-white/15 dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)]" : ""} ${className}`}
        >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,255,255,0.26)_38%,rgba(109,99,255,0.06)_100%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_42%,rgba(158,140,255,0.12)_100%)]" />
            <div className="absolute -right-16 top-[-4.5rem] h-32 w-32 rounded-full bg-[var(--site-secondary)]/18 blur-3xl dark:bg-[var(--site-secondary)]/12" />
            <div className="absolute -left-12 bottom-[-4rem] h-28 w-28 rounded-full bg-[var(--site-accent)]/10 blur-3xl dark:bg-[var(--site-accent)]/14" />
            <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--site-accent)]/30 to-transparent" />

            <div className="relative z-10 flex h-full flex-col">
                {children}
            </div>
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                {content}
            </Link>
        );
    }

    return content;
};

function KPICard({ kpi, delay, dict }: { kpi: KPIData; delay: number; dict?: AdminDashboardDictionary }) {
    const params = useParams();
    const lang = params?.lang || "en";

    let href: string | undefined;
    const label = kpi.label.toLowerCase();
    if (label.includes("user")) href = `/${lang}/admin/users`;
    else if (label.includes("project")) href = `/${lang}/admin/projects`;
    else if (label.includes("post")) href = `/${lang}/admin/posts`;
    else if (label.includes("engagement")) href = `/${lang}/admin/comments`;

    return (
        <WidgetCard delay={delay} interactive={Boolean(href)} href={href}>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="h-2.5 w-2.5 rounded-full shadow-[0_0_16px_rgba(109,99,255,0.22)]"
                            style={{ backgroundColor: kpi.color }}
                        />
                        <p className={cardLabelClass}>
                            {dict?.adminDashboard?.kpis?.[kpi.label.toLowerCase().replace(/ /g, "_")] || kpi.label}
                        </p>
                    </div>

                    <h3 className="text-3xl font-semibold tracking-tight text-slate-950 transition-colors dark:text-white">
                        {kpi.value.toLocaleString()}
                    </h3>
                </div>

                <span className={cardChipClass}>
                    <TrendingUp size={12} />
                    {kpi.trend}
                </span>
            </div>

            <div className="mt-auto pt-6">
                <div className="h-px w-full bg-gradient-to-r from-slate-200/80 via-slate-300/80 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent" />
                <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {href
                            ? (dict?.adminDashboard?.kpis?.view_details || "View Details")
                            : (dict?.adminDashboard?.kpis?.view_analytics || "View Analytics")}
                    </span>
                    <ArrowUpRight size={15} className="text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-slate-500" />
                </div>
            </div>
        </WidgetCard>
    );
}

function AreaChartCard({ growthData: initialGrowthData, dict }: { growthData: GrowthData[]; dict?: AdminDashboardDictionary }) {
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

    const safeData = data.length > 0 ? data : [{ month: "-", users: 0, projects: 0 }];
    const maxValue = Math.max(...safeData.map((entry) => entry.users + entry.projects), 10);
    const points = safeData.map((entry, index) => {
        const x = (index / Math.max(1, safeData.length - 1)) * 600;
        const y = 200 - (((entry.users + entry.projects) / maxValue) * 160);
        return `${x},${y}`;
    }).join(" ");
    const polygonPoints = `0,200 ${points} 600,200`;

    return (
        <WidgetCard delay={0.6} className="col-span-1 min-h-[380px] lg:col-span-2">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className={cardTitleClass}>
                        {dict?.adminDashboard?.platform_growth || "Platform Growth"}
                    </h3>
                    <p className={cardMutedClass}>
                        {dict?.adminDashboard?.new_users_vs_projects || "New users vs projects"}
                        {timeRange === "year" ? " over 5 years" : timeRange === "month" ? " over 6 months" : timeRange === "day" ? " over 7 days" : " over 24 hours"}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/70 p-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                        {["hour", "day", "month", "year"].map((range) => (
                            <button
                                key={range}
                                onClick={() => handleRangeChange(range as "year" | "month" | "day" | "hour")}
                                className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all ${timeRange === range ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] dark:bg-white dark:text-slate-950" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <div className={cardChipClass}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--site-accent)]" />
                        {dict?.adminDashboard?.combined_growth || "Combined Growth"}
                    </div>
                </div>
            </div>

            <div className={`relative mt-6 flex flex-1 flex-col overflow-hidden px-3 pb-4 pt-6 ${insetPanelClass}`}>
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.03]" />
                {isLoading && (
                    <div className="absolute inset-0 z-20 bg-white/35 backdrop-blur-sm dark:bg-black/20" />
                )}

                <div className="absolute inset-x-3 bottom-10 top-8">
                    <svg className="h-full w-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--site-secondary)" stopOpacity="0.22" />
                                <stop offset="100%" stopColor="var(--site-secondary)" stopOpacity="0.02" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        <line x1="0" y1="0" x2="600" y2="0" className="stroke-slate-200 dark:stroke-white/5" strokeWidth="1" />
                        <line x1="0" y1="100" x2="600" y2="100" className="stroke-slate-200 dark:stroke-white/5" strokeWidth="1" />
                        <line x1="0" y1="200" x2="600" y2="200" className="stroke-slate-200 dark:stroke-white/5" strokeWidth="1" />

                        <motion.polygon
                            points={polygonPoints}
                            fill="url(#area-grad)"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                        />
                        <motion.polyline
                            points={points}
                            fill="none"
                            stroke="var(--site-accent)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.6, ease: "easeInOut" }}
                        />
                    </svg>
                </div>

                <div className="relative z-10 mt-auto flex justify-between gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                    {safeData.map((entry, index) => (
                        <span key={`${entry.month}-${index}`} className="truncate">
                            {entry.month}
                        </span>
                    ))}
                </div>
            </div>
        </WidgetCard>
    );
}

function EngagementBarCard({ engagement, dict }: { engagement: EngagementData[]; dict?: AdminDashboardDictionary }) {
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
        <WidgetCard delay={0.7} className="col-span-1 min-h-[380px]">
            <div className="mb-8">
                <h3 className={cardTitleClass}>
                    {dict?.adminDashboard?.category_health || "Category Health"}
                </h3>
                <p className={`${cardMutedClass} mt-2`}>
                    {dict?.adminDashboard?.interaction_balance || "Interaction balance across domains"}
                </p>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-4">
                {engagement.map((item, index) => {
                    const percentage = Math.round((item.value / (item.fullMark || 1)) * 100);
                    return (
                        <Link
                            href={getLinkForSubject(item.subject)}
                            key={item.subject}
                            className={`group/bar rounded-[1.5rem] border border-slate-200/70 bg-white/55 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300/80 hover:bg-white/75 dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.05] ${index === 0 ? "mt-0" : ""}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className={cardLabelClass}>
                                    {dict?.adminDashboard?.kpis?.[item.subject.toLowerCase()] || item.subject}
                                </span>
                                <span className="text-xs font-semibold text-[var(--site-accent)]">
                                    {percentage}%
                                </span>
                            </div>

                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1.1, delay: index * 0.08, type: "spring", stiffness: 70 }}
                                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--site-secondary),var(--site-accent))]"
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 flex items-center gap-4 border-t border-slate-200/80 pt-6 dark:border-white/5">
                <div className="rounded-2xl border border-[var(--site-secondary)]/20 bg-[var(--site-secondary)]/12 p-3">
                    <Activity size={20} className="text-[var(--site-accent)]" />
                </div>
                <div>
                    <p className={cardLabelClass}>
                        {dict?.adminDashboard?.status || "Status"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {dict?.adminDashboard?.highly_active || "Highly Active"}
                    </p>
                </div>
            </div>
        </WidgetCard>
    );
}

function ActivityFeedCard({ activities, dict }: { activities: ActivityType[]; dict?: AdminDashboardDictionary }) {
    const params = useParams();
    const lang = params?.lang || "en";

    return (
        <WidgetCard delay={0.8} className="col-span-1 min-h-[380px]">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h3 className={cardTitleClass}>
                        {dict?.adminDashboard?.live_activity || "Live Activity"}
                    </h3>
                    <p className={`${cardMutedClass} mt-2`}>
                        {dict?.adminDashboard?.real_time_pulse || "Real-time engagement pulse"}
                    </p>
                </div>
                <Link
                    href={`/${lang}/admin/notifications`}
                    className="rounded-2xl border border-slate-200/80 bg-white/65 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                >
                    {dict?.adminDashboard?.see_all || "See All"}
                </Link>
            </div>

            <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                    <div
                        key={activity.id}
                        className="group/item flex items-center gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white/55 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300/80 hover:bg-white/75 dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-white/10 dark:hover:bg-white/[0.05]"
                    >
                        <div className="relative shrink-0">
                            {activity.actor.image ? (
                                <img
                                    src={activity.actor.image}
                                    className="h-12 w-12 rounded-2xl border border-white/60 object-cover shadow-sm dark:border-white/10"
                                    alt={activity.actor.name}
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-100 font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                                    {activity.actor.name?.[0] || "U"}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 rounded-xl border border-white/70 bg-white/80 p-1.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/40">
                                {getActivityIcon(activity.type)}
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover/item:text-[var(--site-accent)] dark:text-white">
                                {activity.actor.name}
                                <span className="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                                    / @{activity.actor.username}
                                </span>
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                {activity.details.description || activity.details.title}
                            </p>
                        </div>

                        <div className="rounded-full border border-slate-200/80 bg-white/65 px-3 py-1 text-[10px] font-semibold text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
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
        case "new_user":
            return <UserPlus size={12} className="text-[var(--site-accent)]" />;
        case "new_project":
            return <FolderOpen size={12} className="text-slate-500 dark:text-slate-400" />;
        case "user_post":
            return <MessageSquare size={12} className="text-[var(--site-accent)]" />;
        default:
            return <Clock size={12} className="text-slate-400 dark:text-slate-500" />;
    }
}

function SystemInsightsCard({ dict }: { dict?: AdminDashboardDictionary }) {
    return (
        <WidgetCard delay={0.9} interactive={false} className="col-span-1 min-h-[380px] items-center justify-center text-center">
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <div className="h-56 w-56 rounded-full border border-[var(--site-accent)]/12" />
                <div className="absolute h-40 w-40 rounded-full border border-[var(--site-secondary)]/20" />
                <div className="absolute h-24 w-24 rounded-full bg-[var(--site-secondary)]/12 blur-2xl" />
            </div>

            <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-[var(--site-secondary)]/22 bg-white/65 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                    <Activity size={32} className="text-[var(--site-accent)]" />
                </div>

                <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {dict?.adminDashboard?.advanced_insights || "Advanced Insights"}
                </h3>
                <p className="mx-auto mt-4 max-w-xs text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                    {dict?.adminDashboard?.system_optimal_desc || "System is performing optimally. Database latency is within limits and platform engagement is trending upward."}
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {["Realtime sync", "Operational visibility", "Admin-ready"].map((label) => (
                        <span
                            key={label}
                            className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </WidgetCard>
    );
}

function PortfolioAdoptionCard({ data, dict }: { data: { active: number; total: number }; dict?: AdminDashboardDictionary }) {
    const percentage = data.total > 0 ? Math.round((data.active / data.total) * 100) : 0;
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, percentage, {
            duration: 1.8,
            ease: "easeOut",
            onUpdate(value) {
                setDisplayValue(Math.round(value));
            },
        });

        return controls.stop;
    }, [percentage]);

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <WidgetCard delay={0.75} className="col-span-1 min-h-[380px] items-center justify-center">
            <div className="mb-6 flex w-full items-start justify-between gap-4">
                <div>
                    <h3 className={cardTitleClass}>
                        {dict?.adminDashboard?.feature_adoption || "Feature Adoption"}
                    </h3>
                    <p className={`${cardMutedClass} mt-2`}>
                        {dict?.adminDashboard?.custom_portfolios_active || "Custom Portfolios Active"}
                    </p>
                </div>
                <div className="rounded-2xl border border-[var(--site-secondary)]/22 bg-[var(--site-secondary)]/12 p-3">
                    <Star size={18} className="text-[var(--site-accent)]" />
                </div>
            </div>

            <div className={`relative flex h-52 w-52 items-center justify-center ${insetPanelClass}`}>
                <div className="absolute inset-5 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(236,244,255,0.55))] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08),rgba(255,255,255,0.01))]" />
                <svg className="h-full w-full -rotate-90">
                    <defs>
                        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="var(--site-secondary)" />
                            <stop offset="100%" stopColor="var(--site-accent)" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="104"
                        cy="104"
                        r={radius}
                        fill="none"
                        className="stroke-slate-200 dark:stroke-white/5"
                        strokeWidth="10"
                    />
                    <motion.circle
                        cx="104"
                        cy="104"
                        r={radius}
                        fill="none"
                        stroke="url(#gauge-grad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {displayValue}%
                    </span>
                    <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        {data.active} / {data.total} {dict?.adminDashboard?.users || "Users"}
                    </span>
                </div>
            </div>

            <div className="mt-8 flex w-full items-center justify-between border-t border-slate-200/80 pt-6 dark:border-white/5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {dict?.adminDashboard?.adoption_rate || "Adoption Rate"}
                </span>
                <div className={cardChipClass}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {dict?.adminDashboard?.growing || "Growing"}
                </div>
            </div>
        </WidgetCard>
    );
}

function ContentDistributionCard({ data, dict }: { data: { image: number; video: number }; dict?: AdminDashboardDictionary }) {
    const total = data.image + data.video || 1;
    const imagePct = (data.image / total) * 100;
    const videoPct = (data.video / total) * 100;

    return (
        <WidgetCard delay={0.8} className="col-span-1 min-h-[380px]">
            <div className="mb-8">
                <h3 className={cardTitleClass}>
                    {dict?.adminDashboard?.content_delivery || "Content Delivery"}
                </h3>
                <p className={`${cardMutedClass} mt-2`}>
                    {dict?.adminDashboard?.project_formats || "Project formats hosted"}
                </p>
            </div>

            <div className={`px-4 py-5 ${insetPanelClass}`}>
                <div className="overflow-hidden rounded-full border border-white/60 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="flex h-7 w-full">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${imagePct}%` }}
                            transition={{ duration: 1.2, type: "spring", bounce: 0.15 }}
                            className="h-full border-r border-white/70 bg-[linear-gradient(90deg,var(--site-secondary),var(--site-accent))] dark:border-black/30"
                        />
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${videoPct}%` }}
                            transition={{ duration: 1.2, type: "spring", bounce: 0.15, delay: 0.1 }}
                            className="h-full bg-slate-300/80 dark:bg-white/12"
                        />
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="mb-3 inline-flex rounded-2xl border border-[var(--site-secondary)]/20 bg-[var(--site-secondary)]/12 p-2.5 text-[var(--site-accent)]">
                            <ImageIcon size={16} />
                        </div>
                        <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                            {Math.round(imagePct)}%
                        </p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                            {dict?.adminDashboard?.images || "Images"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {data.image.toLocaleString()} {dict?.adminDashboard?.total || "total"}
                        </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="mb-3 inline-flex rounded-2xl border border-slate-200/80 bg-slate-100 p-2.5 text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400">
                            <Video size={16} />
                        </div>
                        <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                            {Math.round(videoPct)}%
                        </p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                            {dict?.adminDashboard?.videos || "Videos"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {data.video.toLocaleString()} {dict?.adminDashboard?.total || "total"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-slate-200/80 pt-6 dark:border-white/5">
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                    {dict?.adminDashboard?.storage_impact || "Storage Impact Analyzer"}
                </p>
            </div>
        </WidgetCard>
    );
}

export default function AdminDashboardClient({
    dict,
    kpis,
    growthData,
    engagement,
    activities,
    portfolioAdoption,
    projectTypes,
}: {
    kpis: KPIData[];
    growthData: GrowthData[];
    engagement: EngagementData[];
    activities: ActivityType[];
    portfolioAdoption: { active: number; total: number };
    projectTypes: { image: number; video: number };
    dict?: AdminDashboardDictionary;
}) {
    return (
        <div className="relative pb-10 pt-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden">
                <div className="absolute left-[8%] top-8 h-52 w-52 rounded-full bg-[var(--site-secondary)]/12 blur-[120px] dark:bg-[var(--site-secondary)]/10" />
                <div className="absolute right-[6%] top-14 h-60 w-60 rounded-full bg-[var(--site-accent)]/10 blur-[130px] dark:bg-[var(--site-accent)]/12" />
            </div>

            <div className="mb-8">
                <AdminAnalyticsClient dict={dict} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {kpis.map((kpi, index) => (
                    <KPICard key={kpi.label} kpi={kpi} delay={index * 0.08} dict={dict} />
                ))}
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                <AreaChartCard growthData={growthData} dict={dict} />
                <EngagementBarCard engagement={engagement} dict={dict} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <PortfolioAdoptionCard data={portfolioAdoption} dict={dict} />
                <ContentDistributionCard data={projectTypes} dict={dict} />
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <ActivityFeedCard activities={activities} dict={dict} />
                <SystemInsightsCard dict={dict} />
            </div>
        </div>
    );
}
