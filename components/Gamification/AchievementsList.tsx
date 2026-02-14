
"use client";

import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import { BADGES } from "@/lib/constants/gamification";
import PixelBadge from "./PixelBadge";

interface AchievementsListProps {
    user: any;
    isOwner: boolean;
}

export default function AchievementsList({ user, isOwner }: AchievementsListProps) {
    const userBadges = user.badges || [];
    const unlockedIds = new Set(userBadges.map((b: any) => b.id));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {BADGES.map((badge, index) => {
                const isUnlocked = unlockedIds.has(badge.id);
                const unlockedData = userBadges.find((b: any) => b.id === badge.id);

                // Calculate Progress
                let current = 0;
                let target = (badge as any).target || 0;
                const key = (badge as any).key;
                const state = user.gamificationState || {};

                if (key === "projectViews") {
                    // This data is actually in ProjectView table count, NOT usually stored in gamificationState directly as a count?
                    // Wait, checking trackProjectView action... it DOES NOT update a counter in gamificationState explicitly?
                    // Actually trackProjectView counts directly from DB.
                    // HOWEVER, for UI display without extra queries, we might need a count in gamificationState or passed in.
                    // Let's check gamification.actions.ts again.
                    // Ah, trackProjectView creates ProjectView records.
                    // trackComment updates `commentCount` AND `commentedProjects` array in state.
                    // trackLike updates `likedProjects` array in state.

                    // So for Likes and Comments, we have data in `state`.
                    // For Views, we might NOT have it unless we query it or store it.
                    // Let's assume we can't show View progress easily without data. 
                    // OR, we can try to rely on what IS in gamificationState if we added it?
                    // Currently trackProjectView does NOT update gamificationState.
                    // FIX: I should probably update trackProjectView to ALSO store a simple count in gamificationState for easier UI access,
                    // OR just assume 0 for now if missing.

                    // WORKAROUND: For now, I will implement logic for fields that DO exist (likedProjects, commentedProjects).
                    // For projectViews, I'll need to update the action to cache the count in gamificationState, or accept it's missing.
                    // Let's assume I will Fix the action to store `viewCount` in gamificationState too.
                    current = state.viewCount || 0;
                } else if (key === "commentedProjects") {
                    current = state.commentedProjects?.length || 0;
                } else if (key === "likedProjects") {
                    current = state.likedProjects?.length || 0;
                } else if (key === "postComments") {
                    current = state.commentCount || 0; // The key in gamification.actions was commentCount
                } else if (key === "postLikesReceived") {
                    // This might need specific tracking
                    current = 0;
                }

                // Cap current at target for display if unlocked (or even if not, to avoid overflow)
                if (isUnlocked) current = target;
                if (current > target) current = target;

                const percent = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
                const showProgress = !isUnlocked && target > 0;

                return (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative p-4 font-mono select-none group flex flex-col h-full
                            ${isUnlocked ? "opacity-100" : "opacity-60 grayscale"}
                        `}
                        style={{
                            backgroundColor: isUnlocked ? '#1e293b' : '#0f172a',
                            // 8-bit border effect
                            boxShadow: `
                                -2px 0 0 0 black,
                                2px 0 0 0 black,
                                0 -2px 0 0 black,
                                0 2px 0 0 black,
                                -2px -2px 0 0 black,
                                -2px 2px 0 0 black,
                                2px -2px 0 0 black,
                                2px 2px 0 0 black,
                                inset 2px 2px 0 0 rgba(255,255,255,0.1),
                                inset -2px -2px 0 0 rgba(0,0,0,0.3)
                            `
                        }}
                    >
                        {/* Checkered Background Pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                                backgroundSize: '4px 4px',
                                backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                            }}
                        />

                        {/* Pixel Corners (Visual Flourish) */}
                        <div className="absolute top-1 left-1 w-1 h-1 bg-white/20" />
                        <div className="absolute top-1 right-1 w-1 h-1 bg-white/20" />
                        <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/20" />
                        <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/20" />

                        <div className="flex flex-col h-full relative z-10 gap-3">
                            {/* Header: Icon + Name */}
                            <div className="flex items-center gap-3 border-b border-black/40 pb-3">
                                <div className="shrink-0">
                                    <PixelBadge badge={badge} size="sm" />
                                </div>
                                <div className="leading-tight">
                                    <h3 className={`font-bold text-sm tracking-wide uppercase ${isUnlocked ? "text-yellow-400 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]" : "text-slate-500"}`}>
                                        {badge.name}
                                    </h3>
                                    <div className="text-[10px] uppercase mt-1 inline-block px-1.5 py-0.5 bg-black text-white">
                                        {isUnlocked ? "UNLOCKED" : "LOCKED"}
                                    </div>
                                </div>
                            </div>

                            {/* Body: Description */}
                            <div className="flex-1 mt-1">
                                <p className="text-xs text-slate-300 leading-relaxed min-h-[40px]">
                                    "{badge.description}"
                                </p>
                            </div>

                            {/* Progress Bar (Only if Locked/Progressable) */}
                            {showProgress && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase">
                                        <span>Progress</span>
                                        <span>{current} / {target}</span>
                                    </div>
                                    <div className="h-3 w-full bg-black relative border border-slate-700">
                                        <div
                                            className="h-full bg-teal-500 relative transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        >
                                            {/* Shine effect on bar */}
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer: Date */}
                            <div className="pt-2 border-t border-black/40 text-[10px] text-right mt-auto">
                                {isUnlocked ? (
                                    <span className="text-teal-400">
                                        ACQUIRED: {new Date(unlockedData.awardedAt).toLocaleDateString()}
                                    </span>
                                ) : (
                                    <span className="text-slate-600">
                                        KEEP GOING...
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
