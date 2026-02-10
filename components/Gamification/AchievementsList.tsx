
"use client";

import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import { BADGES } from "@/lib/constants/gamification";

interface AchievementsListProps {
    user: any;
    isOwner: boolean;
}

export default function AchievementsList({ user, isOwner }: AchievementsListProps) {
    const userBadges = user.badges || [];
    const unlockedIds = new Set(userBadges.map((b: any) => b.id));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {BADGES.map((badge, index) => {
                const isUnlocked = unlockedIds.has(badge.id);
                const unlockedData = userBadges.find((b: any) => b.id === badge.id);

                return (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 group
                            ${isUnlocked
                                ? "bg-white/10 dark:bg-white/5 border-teal-500/30 shadow-lg shadow-teal-500/10"
                                : "bg-white/5 dark:bg-white/5 border-white/10 opacity-70 hover:opacity-100"
                            }
                        `}
                    >
                        {/* Background Glow for Unlocked */}
                        {isUnlocked && (
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10 pointer-events-none" />
                        )}

                        <div className="flex items-start gap-4 relative z-10">
                            {/* Icon Container */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner
                                ${isUnlocked
                                    ? "bg-gradient-to-br from-teal-400 to-cyan-600 text-white shadow-teal-500/20"
                                    : "bg-gray-200 dark:bg-white/10 text-gray-400 grayscale"
                                }
                            `}>
                                {isUnlocked ? badge.icon : <Lock size={24} />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-bold text-lg ${isUnlocked ? "text-[var(--glass-text)]" : "text-gray-500"}`}>
                                        {badge.name}
                                    </h3>
                                    {isUnlocked && (
                                        <div className="bg-teal-500/20 text-teal-600 dark:text-teal-400 p-1 rounded-full">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-[var(--glass-text-muted)] mb-3">
                                    {badge.description}
                                </p>

                                {isUnlocked ? (
                                    <div className="text-xs font-mono text-teal-600 dark:text-teal-400/80 bg-teal-500/10 inline-block px-2 py-1 rounded-md">
                                        Unlocked on {new Date(unlockedData.awardedAt).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400 italic flex items-center gap-1">
                                        <Lock size={12} />
                                        Locked
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
