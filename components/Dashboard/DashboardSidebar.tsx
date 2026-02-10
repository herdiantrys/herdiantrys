"use client";

import ProfileCard from "./ProfileCard";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Bell, Bookmark, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function DashboardSidebar({ user, isPublic = false, dict }: { user: any; isPublic?: boolean; dict?: any }) {
    const pathname = usePathname();

    if (!user) return null;

    // Use english as fallback if dict is missing (optional safety)
    const t = dict?.dashboard || {};

    return (
        <aside className="sticky top-28 space-y-6">

            <ProfileCard user={user} isPublic={isPublic} />

            {/* Navigation Menu - Only show if NOT public */}
            {/* Gamification Stats */}
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg space-y-5">
                {/* Level & XP */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider">Level {user.level || 1}</span>
                        <span className="text-xs text-teal-400 font-mono">{user.xp || 0} XP</span>
                    </div>
                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                            style={{ width: `${Math.min(((user.xp || 0) / 1000) * 100, 100)}%` }} // Assumes 1000 XP per level cap for demo
                        />
                    </div>
                </div>

                {/* Exploration Progress */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider">Exploration</span>
                        <span className="text-xs text-purple-400 font-mono">{user.explorationProgress || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${user.explorationProgress || 0}%` }}
                        />
                    </div>
                </div>

                {/* Badges */}
                {user.badges && Array.isArray(user.badges) && user.badges.length > 0 ? (
                    <div>
                        <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider block mb-3">Badges</span>
                        <div className="flex flex-wrap gap-2">
                            {user.badges.map((badge: any, idx: number) => (
                                <div key={idx} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white/10 shadow-sm flex items-center justify-center text-[10px] font-bold text-white relative group cursor-help" title={badge.name || "Badge"}>
                                    {badge.icon ? <img src={badge.icon} alt={badge.name} className="w-full h-full object-cover rounded-full" /> : (badge.name?.[0] || "B")}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <span className="text-xs font-bold text-[var(--glass-text-muted)] uppercase tracking-wider block mb-2">Badges</span>
                        <div className="text-xs text-[var(--glass-text-muted)] italic">No badges earned yet.</div>
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
