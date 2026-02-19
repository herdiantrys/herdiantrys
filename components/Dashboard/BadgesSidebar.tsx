"use client";

import { motion } from "framer-motion";
import { Trophy, ChevronRight, Sparkles, Lock } from "lucide-react";
import { BADGES } from "@/lib/constants/gamification";
import PixelBadge from "../Gamification/PixelBadge";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface BadgesSidebarProps {
    user: any;
    isOwner?: boolean;
    dict?: any;
    maxDisplay?: number;
}

export default function BadgesSidebar({ user, isOwner = false, dict, maxDisplay = 4 }: BadgesSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const userBadges = user.badges || [];
    const unlockedBadges = userBadges.filter((b: any) => b.id);
    const totalBadges = BADGES.length;
    const completionPercent = totalBadges > 0 ? Math.round((unlockedBadges.length / totalBadges) * 100) : 0;

    // Get most recent unlocked badges
    const recentBadges = [...unlockedBadges]
        .sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime())
        .slice(0, maxDisplay);

    // Get close-to-unlock badges (for motivation)
    const closeToUnlock = BADGES.filter(badge => {
        const isUnlocked = unlockedBadges.some((ub: any) => ub.id === badge.id);
        if (isUnlocked) return false;

        const key = (badge as any).key;
        const target = (badge as any).target || 0;
        const state = user.gamificationState || {};

        let current = 0;
        if (key === "projectViews") current = state.viewCount || 0;
        else if (key === "commentedProjects") current = state.commentedProjects?.length || 0;
        else if (key === "likedProjects") current = state.likedProjects?.length || 0;
        else if (key === "postComments") current = state.commentCount || 0;

        const progress = target > 0 ? (current / target) * 100 : 0;
        return progress >= 50; // Show if 50% or more complete
    }).slice(0, 2);

    const handleViewAll = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', 'achievements');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="mb-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty("--mouse-x", `${x}px`);
                    card.style.setProperty("--mouse-y", `${y}px`);
                }}
                className="bg-white/5 dark:bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group/card transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(var(--site-secondary-rgb),0.15)]"
            >
                {/* Dynamic Spotlight Effect */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--site-secondary-rgb), 0.1), transparent 40%)`
                    }}
                />

                {/* Arcane Background Patterns */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--site-secondary)]/10 rounded-full blur-[80px] -mr-10 -mt-10 animate-pulse pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--site-primary)]/10 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--site-secondary)]/20 to-transparent border border-[var(--site-secondary)]/20 shadow-inner">
                            <Trophy className="text-[var(--site-secondary)] drop-shadow-[0_0_8px_rgba(var(--site-secondary-rgb),0.5)]" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-tight leading-none mb-1">
                                Achievements
                            </h3>
                            <p className="text-[10px] text-[var(--glass-text-muted)] uppercase tracking-widest font-bold">Progress Journey</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-white">
                            {unlockedBadges.length}<span className="text-[var(--glass-text-muted)] font-bold text-xs">/{totalBadges}</span>
                        </span>
                        <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full bg-[var(--site-secondary)] shadow-[0_0_10px_var(--site-secondary)]"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Progress Visualizer - Circular Core */}
                <div className="relative w-36 h-36 mx-auto mb-10 group/ring">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--site-secondary)]/5 to-transparent blur-xl scale-110 group-hover/ring:scale-125 transition-transform duration-700" />

                    <svg className="transform -rotate-90 w-full h-full relative z-10" viewBox="0 0 100 100">
                        {/* Track */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-white/5"
                        />
                        {/* Glow Layer */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="var(--site-secondary)"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${completionPercent * 2.64} 264`}
                            strokeLinecap="round"
                            className="opacity-20 blur-[2px]"
                        />
                        {/* Main Bar */}
                        <motion.circle
                            initial={{ strokeDasharray: "0 264" }}
                            animate={{ strokeDasharray: `${completionPercent * 2.64} 264` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="url(#badgeRingGradient)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="badgeRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className="[stop-color:var(--site-secondary)]" />
                                <stop offset="100%" className="[stop-color:var(--site-primary)]" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="relative">
                            <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{completionPercent}</span>
                            <span className="text-xs font-bold text-[var(--site-secondary)] absolute -top-1 -right-4">%</span>
                        </div>
                        <span className="text-[10px] text-[var(--glass-text-muted)] uppercase tracking-[0.2em] font-black mt-1">Mastery</span>
                    </div>

                    {/* Orbiting Sparkle Decor */}
                    <div className="absolute top-0 left-1/2 -ml-1 -mt-1 w-2 h-2 rounded-full bg-[var(--site-secondary)] shadow-[0_0_10px_var(--site-secondary)] animate-ping opacity-75" />
                </div>

                {/* Sections List */}
                <div className="space-y-6 relative z-10">
                    {/* Recent Unlocked Badges */}
                    {recentBadges.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[10px] font-black text-[var(--glass-text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles size={12} className="text-[var(--site-secondary)]" />
                                    Latest Laurels
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {recentBadges.map((userBadge: any, idx: number) => {
                                    const badge = BADGES.find(b => b.id === userBadge.id);
                                    if (!badge) return null;

                                    return (
                                        <motion.div
                                            key={userBadge.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group/badge p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-[var(--site-secondary)]/30 transition-all cursor-pointer relative overflow-hidden"
                                            onClick={handleViewAll}
                                        >
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="shrink-0 relative">
                                                    <div className="absolute inset-0 bg-[var(--site-secondary)]/20 rounded-lg blur-md opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                                                    <PixelBadge badge={badge} size="sm" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-xs font-bold text-white truncate group-hover/badge:text-[var(--site-secondary)] transition-colors">
                                                        {badge.name}
                                                    </h5>
                                                    <p className="text-[10px] text-[var(--glass-text-muted)] font-medium">
                                                        Unlocked {formatDate(userBadge.awardedAt)}
                                                    </p>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-black/20 opacity-0 group-hover/badge:opacity-100 transition-opacity">
                                                    <ChevronRight size={12} className="text-[var(--site-secondary)]" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Almost There Section */}
                    {closeToUnlock.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-[var(--glass-text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Lock size={12} className="text-amber-500/70" />
                                Within Reach
                            </h4>

                            <div className="grid grid-cols-1 gap-2">
                                {closeToUnlock.map((badge) => {
                                    const key = (badge as any).key;
                                    const target = (badge as any).target || 0;
                                    const state = user.gamificationState || {};

                                    let current = 0;
                                    if (key === "projectViews") current = state.viewCount || 0;
                                    else if (key === "commentedProjects") current = state.commentedProjects?.length || 0;
                                    else if (key === "likedProjects") current = state.likedProjects?.length || 0;
                                    else if (key === "postComments") current = state.commentCount || 0;

                                    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;

                                    return (
                                        <div
                                            key={badge.id}
                                            className="group/lock p-2.5 rounded-xl bg-black/20 border border-white/5 hover:border-amber-500/20 transition-all cursor-pointer"
                                            onClick={handleViewAll}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="shrink-0 grayscale opacity-40 group-hover/lock:opacity-80 transition-opacity scale-90">
                                                    <PixelBadge badge={badge} size="sm" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-[11px] font-bold text-slate-300 truncate">
                                                        {badge.name}
                                                    </h5>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-tighter">In Pursuit</span>
                                                        <span className="text-[9px] font-mono text-slate-500">{current}/{target}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 group-hover/lock:shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-700"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                    <button
                        onClick={handleViewAll}
                        className="w-full group/btn relative py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[var(--site-secondary)]/10 to-transparent border border-[var(--site-secondary)]/20 hover:border-[var(--site-secondary)]/40 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--site-secondary)]/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--site-secondary)] relative z-10 group-hover/btn:scale-105 transition-transform">
                            Full Hall of Fame
                        </span>
                        <ChevronRight size={16} className="text-[var(--site-secondary)] relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Background Noise Layer */}
                <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
            </motion.div>
        </div>
    );
}
