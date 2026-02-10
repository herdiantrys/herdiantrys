"use client";

import ProfileCard from "./ProfileCard";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Bell, Bookmark, Settings, LogOut, ShieldCheck, LayoutDashboard, ShoppingBag, Search, Briefcase } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LEVELS } from "@/lib/constants/gamification";
import { useState } from "react";

export default function DashboardSidebar({ user, isPublic = false, dict }: { user: any; isPublic?: boolean; dict?: any }) {
    const pathname = usePathname() || "/";
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, "") || "/";


    if (!user) return null;

    // Use english as fallback if dict is missing (optional safety)
    const t = dict?.dashboard || {};

    // Calculate Level Progress
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const currentLevelData = LEVELS.find(l => l.level === currentLevel);
    const nextLevelData = LEVELS.find(l => l.level === currentLevel + 1);

    const currentLevelMinXP = currentLevelData?.minXP || 0;
    const nextLevelMinXP = nextLevelData?.minXP || (currentLevelMinXP + 1000); // Default step if max level

    // Progress within current level
    const xpInLevel = Math.max(0, currentXP - currentLevelMinXP);
    const xpRequiredForLevel = nextLevelMinXP - currentLevelMinXP;
    const levelProgress = Math.min(100, (xpInLevel / xpRequiredForLevel) * 100);

    return (
        <aside className="sticky top-28 space-y-6">

            <ProfileCard user={user} isPublic={isPublic} />

            {/* Admin Quick Access - For robust visibility */}
            {!isPublic && ['admin', 'superadmin'].includes(user.role?.toLowerCase() || '') && (
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-2xl p-2 shadow-xl shrink-0">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 group"
                    >
                        <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                        Admin Management
                    </Link>
                </div>
            )}

            {/* Quick Navigation Menu */}
            {!isPublic && (
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-2xl p-2 shadow-xl shrink-0">
                    <div className="px-4 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500/40">
                        Navigation
                    </div>
                    <div className="space-y-1 py-1">
                        {[
                            { name: "Home", href: "/dashboard", icon: Home },
                            { name: "Inventory", href: "/dashboard?tab=inventory", icon: ShoppingBag },
                            { name: "Notifications", href: "/notifications", icon: Bell },
                            { name: "Works", href: "/projects", icon: Briefcase },
                            { name: "Search", href: "/search", icon: Search },
                            { name: "Settings", href: "/settings", icon: Settings },
                            // Add Admin Panel link directly in menu for admins
                            ...(['admin', 'superadmin'].includes(user.role?.toLowerCase() || '')
                                ? [{ name: "Admin Panel", href: "/admin", icon: ShieldCheck }]
                                : [])
                        ].map((item) => {
                            const isActive = normalizedPath === item.href || (item.href !== "/dashboard" && normalizedPath.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-3 rounded-xl transition-all group relative duration-300
                                        ${isActive ? "text-teal-400 font-bold" : "text-[var(--glass-text-muted)] hover:text-white"}
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="dashboard-nav-active-bg"
                                            className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 shadow-[0_4px_16px_rgba(255,255,255,0.05)] backdrop-blur-sm -z-10"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                        />
                                    )}

                                    <div className="relative">
                                        <Icon size={18} className={`min-w-[18px] transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]" : "opacity-70 group-hover:opacity-100"}`} />
                                    </div>

                                    <span className="ml-3 text-sm tracking-tight whitespace-nowrap">
                                        {item.name}
                                    </span>

                                    {isActive && (
                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-[2.5px] bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Gamification Stats */}
            <div className="bg-white/50 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6 overflow-hidden relative group">
                {/* Liquid Shine Edge */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                {/* Level & XP */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider block">Level {user.level || 1}</span>
                            <span className="text-sm font-bold text-[var(--glass-text)]">{currentLevelData?.name || "Visitor"}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-teal-400 font-mono block">{user.xp || 0} XP</span>
                            <span className="text-[10px] text-[var(--glass-text-muted)]">Next: {nextLevelMinXP} XP</span>
                        </div>
                    </div>
                    <div className="h-3 w-full bg-black/20 dark:bg-white/5 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${Math.min(levelProgress, 100)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Exploration Progress */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider">Exploration</span>
                        <span className="text-xs text-purple-400 font-mono">{user.explorationProgress || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/20 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${user.explorationProgress || 0}%` }}
                        />
                    </div>
                </div>

                {/* Badges */}
                {user.badges && Array.isArray(user.badges) && user.badges.length > 0 ? (
                    <div>
                        <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider block mb-3">Badges ({user.badges.length})</span>
                        <div className="flex flex-wrap gap-3">
                            {user.badges.map((badge: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 shadow-sm flex items-center justify-center text-xl relative group cursor-help transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:border-teal-500/30"
                                    title={badge.name || "Badge"}
                                >
                                    {/* Render emoji/icon based on content */}
                                    {badge.icon && (badge.icon.startsWith('/') || badge.icon.startsWith('http')) ? (
                                        <img src={badge.icon} alt={badge.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <span className="drop-shadow-md filter">{badge.icon || (badge.name?.[0] || "B")}</span>
                                    )}

                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 backdrop-blur-md text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                        {badge.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider block mb-2">Badges</span>
                        <div className="text-xs text-[var(--glass-text-muted)] italic">No badges earned yet. Start exploring!</div>
                    </div>
                )}
            </div>

            {/* If public, maybe details? */}
            {isPublic && user.bio && (
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
                    <h3 className="font-bold text-[var(--glass-text)] mb-2 text-sm uppercase tracking-wider">{t.about_title || "About"}</h3>
                    <p className="text-sm text-[var(--glass-text-muted)] leading-relaxed">
                        {user.bio}
                    </p>
                </div>
            )}
        </aside>
    );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
                ? "bg-white/10 text-teal-400"
                : "text-[var(--glass-text-muted)] hover:bg-white/5 hover:text-[var(--glass-text)]"
                }`}
        >
            <Icon size={20} />
            {label}
        </Link>
    );
}
