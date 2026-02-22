"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Globe, TrendingUp, BarChart2 } from "lucide-react";
import { getVisitsStats, AnalyticsStatsResponse } from "@/lib/actions/analytics.actions";

// Reusing the beautiful liquid glass wrapper
const WidgetCard = ({ children, delay = 0, interactive = true, className = "" }: { children: React.ReactNode, delay?: number, interactive?: boolean, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
            className={`relative bg-[var(--site-primary)]/40 dark:bg-black/20 backdrop-blur-2xl rounded-[2.5rem] p-6 lg:p-8 overflow-hidden 
                       border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                       flex flex-col group
                       ${interactive ? 'cursor-pointer hover:bg-[var(--site-primary)]/50 dark:hover:bg-black/30 hover:-translate-y-1' : ''} transition-all duration-500 ${className}`}
        >
            <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] dark:shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] pointer-events-none z-0" />
            <div className="relative z-10 flex flex-col h-full w-full">
                {children}
            </div>
        </motion.div>
    );
};

export default function AdminAnalyticsClient({ dict }: { dict?: any }) {
    const [timeRange, setTimeRange] = useState<"year" | "month" | "day" | "hour">("day");
    const [data, setData] = useState<AnalyticsStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        getVisitsStats(timeRange).then((res) => {
            if (isMounted) {
                setData(res);
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [timeRange]);

    const handleRangeChange = (range: "year" | "month" | "day" | "hour") => {
        if (range !== timeRange) {
            setTimeRange(range);
        }
    };

    const timeline = data?.success ? data.timeline : [];
    const topPages = data?.success ? data.topPages : [];
    const totalVisits = data?.success ? data.totalVisits : 0;

    // Generate Path Points
    const points = timeline.map((d, i) => {
        const x = (i / Math.max(1, timeline.length - 1)) * 600;
        const maxVal = Math.max(...timeline.map((t) => t.visits), 5); // ensure at least some height
        const y = 200 - (d.visits / maxVal) * 160;
        return `${x},${y}`;
    }).join(" ");

    const polygonPoints = `0,200 ${points} 600,200`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">

            {/* Timeline Area Chart */}
            <WidgetCard delay={0.2} className="col-span-1 lg:col-span-2 min-h-[350px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Globe size={18} className="text-[var(--site-secondary)]" /> {dict?.adminDashboard?.traffic_analytics || "Traffic Analytics"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                            {dict?.adminDashboard?.website_visits || "Website visits over the last"} {timeRange === 'year' ? '5 years' : timeRange === 'month' ? '6 months' : timeRange === 'day' ? '7 days' : '24 hours'}
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
                    </div>
                </div>

                <div className="mb-4">
                    <span className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
                        {totalVisits.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-gray-400 dark:text-gray-500 ml-2 uppercase tracking-widest">{dict?.adminDashboard?.total_visits || "Total Visits"}</span>
                </div>

                <div className="relative mt-auto h-full flex flex-col justify-end w-full">
                    <div className="absolute inset-x-[-1.5rem] bottom-8 h-40 pointer-events-none">
                        <svg className={`w-full h-full overflow-visible transition-opacity duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100 blur-none'}`} viewBox="0 0 600 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="analytics-area-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--site-secondary)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="var(--site-secondary)" stopOpacity="0.0" />
                                </linearGradient>
                                <filter id="analytics-glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            <line x1="0" y1="0" x2="600" y2="0" className="stroke-black/5 dark:stroke-white/5" strokeWidth="1" />
                            <line x1="0" y1="100" x2="600" y2="100" className="stroke-black/5 dark:stroke-white/5" strokeWidth="1" />
                            <line x1="0" y1="200" x2="600" y2="200" className="stroke-black/5 dark:stroke-white/5" strokeWidth="1" />

                            <motion.polygon
                                points={polygonPoints}
                                fill="url(#analytics-area-grad)"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.5, delay: 0.2 }}
                            />
                            <motion.polyline
                                points={points}
                                fill="none"
                                stroke="var(--site-secondary)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#analytics-glow)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-auto z-20 px-2 lg:px-8">
                        {timeline.map((d, index) => <span key={d.label + index}>{d.label}</span>)}
                    </div>
                </div>
            </WidgetCard>

            {/* Top Pages List */}
            <WidgetCard delay={0.4} className="col-span-1 min-h-[350px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <BarChart2 size={18} className="text-[var(--site-secondary)]" /> {dict?.adminDashboard?.top_pages || "Top Pages"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">{dict?.adminDashboard?.most_visited || "Most visited routes"}</p>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full w-full opacity-50">
                            <div className="w-6 h-6 border-2 border-[var(--site-secondary)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : topPages.length > 0 ? (
                        topPages.map((page, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                key={page.path}
                                className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-4">{page.path}</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--site-secondary)] bg-white/50 dark:bg-black/20 px-2 py-1 rounded-xl shadow-sm">
                                    {page.visits.toLocaleString()} <TrendingUp size={10} />
                                </span>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center text-sm font-medium text-gray-400 dark:text-gray-500 mt-10">No visits recorded yet.</div>
                    )}
                </div>
            </WidgetCard>
        </div>
    );
}
