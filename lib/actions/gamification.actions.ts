"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { LEVELS, BADGES } from "@/lib/constants/gamification";

// using Prisma.TransactionClient directly

export async function awardXP(userId: string, amount: number, reason: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { xp: true, level: true, explorationProgress: true }
            });

            if (!user) throw new Error("User not found");

            const newXP = (user.xp || 0) + amount;

            // Calculate new level
            let newLevel = user.level;
            let newRoleName = LEVELS.find(l => l.level === user.level)?.name || "Visitor";

            for (const tier of LEVELS) {
                if (newXP >= tier.minXP) {
                    newLevel = tier.level;
                    newRoleName = tier.name;
                }
            }

            const leveledUp = newLevel > (user.level || 1);

            // Update User
            await tx.user.update({
                where: { id: userId },
                data: {
                    xp: newXP,
                    level: newLevel
                }
            });

            return {
                success: true,
                xp: newXP,
                level: newLevel,
                leveledUp,
                amount,
                roleName: newRoleName
            };
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

        return result;

    } catch (error: any) {
        console.error("Error awarding XP:", error);
        return { success: false, error: error.message || "Failed to award XP" };
    }
}

export async function updateExplorationProgress(userId: string, progressToAdd: number) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId }, select: { explorationProgress: true } });
            if (!user) return { success: false, error: "User not found" };

            const current = user.explorationProgress || 0;
            if (current >= 100) return { success: true, progress: current };

            const newProgress = Math.min(current + progressToAdd, 100);

            await tx.user.update({
                where: { id: userId },
                data: { explorationProgress: newProgress }
            });

            return { success: true, progress: newProgress };
        });

        return result;

    } catch (error) {
        console.error("Error updating exploration:", error);
        return { success: false };
    }
}

// Allow passing a transaction client for composition
export async function checkAndAwardBadge(userId: string, badgeId: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { badges: true }
        });

        if (!user) return;

        const currentBadges = (user.badges as any[]) || [];
        if (currentBadges.some(b => b.id === badgeId)) return; // Already awarded

        const badgeDef = BADGES.find(b => b.id === badgeId);
        if (!badgeDef) return;

        const newBadge = { ...badgeDef, awardedAt: new Date().toISOString() };

        await db.user.update({
            where: { id: userId },
            data: {
                badges: [...currentBadges, newBadge]
            }
        });

        return { success: true, badge: newBadge };

    } catch (error) {
        console.error("Error awarding badge:", error);
    }
}

export async function trackProjectView(userId: string, projectId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { gamificationState: true, badges: true }
            });

            if (!user) return; // Silent fail inside tx

            const state: any = user.gamificationState || { viewedProjects: [], readCaseStudies: [] };

            // Track Unique Views
            if (!state.viewedProjects) state.viewedProjects = [];
            if (!state.viewedProjects.includes(projectId)) {
                state.viewedProjects.push(projectId);
            }

            // Update state
            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });

            // Logic for Portfolio Explorer (5 projects)
            if (state.viewedProjects.length >= 5) {
                // Pass the current transaction client to ensure atomicity
                await checkAndAwardBadge(userId, "portfolio_explorer", tx);
            }
        });

        return { success: true };
    } catch (e) {
        console.error("Error tracking view:", e);
    }
}

export async function trackContactMessage(userId: string) {
    try {
        // Simple enough to probably not need a complex transaction, 
        // but let's be consistent if we are reading state. 
        // Actually this one just awards a badge, so we can just call checkAndAwardBadge directly.
        // However, if we wanted to enforce "only 1 message needed", checkAndAwardBadge handles usage check.
        // Let's just wrap it to be safe if we add more logic later,
        // OR just call checkAndAwardBadge which now supports tx but works without it.

        return await checkAndAwardBadge(userId, "connector");

    } catch (e) {
        console.error("Error tracking message:", e);
    }
}

export async function trackDeepThinker(userId: string) {
    // Called when user scrolls to end of a "Case Study" or any project
    try {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { gamificationState: true }
            });

            if (!user) return;
            const state: any = user.gamificationState || { readCount: 0 };
            state.readCount = (state.readCount || 0) + 1;

            // Update state FIRST
            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });

            if (state.readCount >= 3) {
                await checkAndAwardBadge(userId, "deep_thinker", tx);
            }
        });
    } catch (e) {
        console.error(e);
    }
}
