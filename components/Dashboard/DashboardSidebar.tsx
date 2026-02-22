"use client";

import ProfileCard from "./ProfileCard";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home, Bell, Bookmark, Settings, LogOut, ShieldCheck, LayoutDashboard, ShoppingBag, Search, Briefcase } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LEVELS } from "@/lib/constants/gamification";
import { useState } from "react";
import GamificationModal from "../Gamification/GamificationModal";
import PixelBadge from "../Gamification/PixelBadge";
import { formatNumber } from "@/lib/utils";

interface Rank {
    id: string;
    name: string;
    subtitle?: string | null;
    minXP: number;
    description: string | null;
    image: string | null;
}

export default function DashboardSidebar({ user, isPublic = false, dict, showNavigation = true, ranks = [] }: { user: any; isPublic?: boolean; dict?: any; showNavigation?: boolean; ranks?: Rank[] }) {
    const pathname = usePathname() || "/";
    const searchParams = useSearchParams();
    const currentTab = searchParams?.get("tab");
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, "") || "/";
    const [isGamificationModalOpen, setIsGamificationModalOpen] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({});


    if (!user) return null;

    // Use english as fallback if dict is missing (optional safety)
    const t = dict?.dashboard || {};

    // Calculate Level Progress
    // Calculate Level Progress (1 Level per 100 XP)
    const currentXP = user.xp || 0;
    const currentLevel = Math.floor(currentXP / 100) + 1;

    // Progress within current level (0-99)
    const xpInLevel = currentXP % 100;
    const xpRequiredForLevel = 100; // Fixed 100 XP per level
    const levelProgress = xpInLevel; // Since req is 100, xp is directly percentage

    // Calculate Rank
    // Fallback to empty array if ranks not provided, though it should be
    const sortedRanks = [...ranks].sort((a, b) => a.minXP - b.minXP);
    const currentRank = [...sortedRanks].reverse().find(r => currentXP >= r.minXP) || sortedRanks[0] || { name: "Visitor", minXP: 0, description: "Welcome!", image: null };

    // Next Rank Logic
    const nextRankIndex = sortedRanks.findIndex(r => r.name === currentRank.name) + 1;
    const nextRank = sortedRanks[nextRankIndex];

    return (
        <div className="space-y-6">
            <ProfileCard user={user} isPublic={isPublic} dict={dict} />

            {/* Admin Quick Access - For robust visibility */}
            {!isPublic && ['admin', 'superadmin'].includes(user.role?.toLowerCase() || '') && (
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-2xl p-2 shadow-xl shrink-0">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm bg-[var(--site-accent)]/10 text-[var(--site-accent)] hover:bg-[var(--site-accent)]/20 border border-[var(--site-accent)]/20 group"
                    >
                        <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                        {t.admin_management || "Admin Management"}
                    </Link>
                </div>
            )}


            {/* Gamification Stats - RPG Fantasy Design */}
            {/* Gamification Stats - RPG Fantasy Design */}
            <div
                onClick={() => setIsGamificationModalOpen(true)}
                onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;
                    setTiltStyle({
                        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                        transition: 'transform 0.1s ease-out'
                    });
                }}
                onMouseLeave={() => {
                    setTiltStyle({
                        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                        transition: 'transform 0.5s ease-out'
                    });
                }}
                style={tiltStyle}
                className="relative group overflow-hidden rounded-2xl border border-amber-500/20 bg-black/80 shadow-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-500/40 cursor-pointer"
            >

                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/60 to-black/95 z-10" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 z-0 mix-blend-overlay pointer-events-none"></div>

                {/* Rank Illustration Background */}
                <div className="absolute top-0 left-0 w-full h-[65%] z-0 overflow-hidden">
                    <img
                        src={(currentRank as any).image || "/images/ranks/RANK 1_Wanderer.png"}
                        alt={currentRank.name}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-[2s] ease-in-out group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            ((e.target as HTMLImageElement).parentNode as HTMLElement).style.background = 'linear-gradient(45deg, #0f172a, #1e293b)';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                </div>

                {/* Content Container */}
                <div className="relative z-20 p-5 mt-40 flex flex-col justify-end min-h-[160px]">

                    {/* Rank Title & Level Badge */}
                    <div className="flex items-end justify-between mb-3">
                        <div className="flex-1 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                            <h3 className="text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-500 tracking-wide leading-tight">
                                {currentRank.name.split(' (')[0]}
                            </h3>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-500/90 font-bold mb-1 shadow-black drop-shadow-md">
                                {currentRank.subtitle || currentRank.name.split('(')[1]?.replace(')', '') || "Adventurer"}
                            </div>
                        </div>

                        {/* Level Badge */}
                        <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-b from-slate-800 to-black border-2 border-amber-500/50 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0 ml-2 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <div className="absolute inset-0 bg-amber-500/10 rounded-xl animate-pulse" />
                            <div className="text-center z-10">
                                <div className="text-[9px] text-amber-500/80 uppercase font-black tracking-widest leading-none mb-0.5">{t.lvl || "LVL"}</div>
                                <div className="text-2xl font-black text-white leading-none font-serif">{currentLevel}</div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 italic font-medium mb-5 pl-3 border-l-2 border-amber-500/40 leading-relaxed bg-black/40 p-2 rounded-r-lg backdrop-blur-sm">
                        "{currentRank.description}"
                    </p>

                    {/* XP Progress Bar */}
                    <div className="relative mb-2">
                        <div className="flex justify-between text-[10px] font-bold tracking-wider text-slate-400 mb-1.5 uppercase">
                            <span className="text-amber-500/80">{t.next_rank_progress || "Next Rank Progress"}</span>
                            <span className="text-white">{xpInLevel} <span className="text-slate-600">/</span> 100 XP</span>
                        </div>

                        <div className="h-3 w-full bg-slate-900/80 rounded-full p-[2px] border border-white/10 shadow-inner relative overflow-hidden backdrop-blur-sm">
                            {/* Active Bar */}
                            <div
                                className="h-full bg-gradient-to-r from-amber-800 via-amber-500 to-yellow-300 rounded-full relative shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                                style={{ width: `${Math.min(levelProgress, 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-30 mix-blend-overlay" />
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/40 to-transparent opacity-50" />
                            </div>
                        </div>
                        <div className="text-right mt-1.5">
                            <span className="text-[9px] text-slate-500 font-mono tracking-widest">{t.total_xp || "TOTAL XP"}: <span className="text-slate-300">{formatNumber(currentXP)}</span></span>
                        </div>
                    </div>
                </div>

                {/* Decorative Borders */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-50" />
            </div>

            {/* Gamification Modal */}
            <GamificationModal
                isOpen={isGamificationModalOpen}
                onClose={() => setIsGamificationModalOpen(false)}
                user={user}
                ranks={sortedRanks}
            />
        </div>
    );
}


function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
                ? "bg-white/10 text-[var(--site-accent)]"
                : "text-[var(--glass-text-muted)] hover:bg-white/5 hover:text-[var(--glass-text)]"
                }`}
        >
            <Icon size={20} />
            {label}
        </Link>
    );
}
