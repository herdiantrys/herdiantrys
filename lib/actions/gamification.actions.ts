"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { serializeForClient } from "@/lib/utils";

import { LEVELS, BADGES } from "@/lib/constants/gamification";
import { getRanks } from "@/lib/actions/rank.actions"; // Import rank actions
import { createNotification } from "./notification.actions";
import { createActivity } from "./activity.actions";

// using Prisma.TransactionClient directly

/**
 * Award Runes (Points) to a user.
 */
export async function awardRunes(userId: string, amount: number, reason: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    try {
        await db.user.update({
            where: { id: userId },
            data: { points: { increment: amount } }
        });

        // Notify User of Runes Award (Async)
        createNotification({
            recipientId: userId,
            senderId: "system",
            type: "coin_award",
            details: { amount, reason: reason.replace(/_/g, ' ') }
        }).catch(e => console.error("Runes Notification Error:", e));

        revalidatePath("/");
        revalidatePath("/dashboard");
        revalidatePath("/shop");

        return { success: true };
    } catch (error) {
        console.error("Error awarding runes:", error);
        return { success: false };
    }
}

export async function awardXP(userId: string, amount: number, reason: string, tx?: Prisma.TransactionClient) {
    try {
        const executeUpdate = async (currentTx: Prisma.TransactionClient) => {
            const user = await currentTx.user.findUnique({
                where: { id: userId },
                select: { xp: true, level: true, gamificationState: true }
            });

            if (!user) throw new Error("User not found");

            // Daily Limit Check
            const state: any = user.gamificationState || {};
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            // Initialize limits if not present
            if (!state.dailyLimits) state.dailyLimits = {};

            // Check if already awarded today for this reason
            if (state.dailyLimits[reason] === today) {
                return serializeForClient({ success: false, limitReached: true, message: "Daily limit reached for this action." });
            }

            // Update limit for today
            state.dailyLimits[reason] = today;

            const newXP = (user.xp || 0) + amount;

            // Calculate new level (1 Level per 100 XP)
            const newLevel = Math.floor(newXP / 100) + 1;

            // Fetch Ranks from DB
            const dbRanks = await currentTx.rank.findMany({ orderBy: { minXP: 'asc' } });
            // Fallback to constants if DB empty? Or assume seeded.

            // Find current rank based on newXP
            const reversedRanks = [...dbRanks].reverse();
            const currentRank = reversedRanks.find(r => newXP >= r.minXP) || dbRanks[0];

            const newRoleName = currentRank?.name || "Visitor";

            const leveledUp = newLevel > (user.level || 1);

            // Update User
            await currentTx.user.update({
                where: { id: userId },
                data: {
                    xp: newXP,
                    level: newLevel,
                    gamificationState: state
                }
            });

            return serializeForClient({
                success: true,
                xp: newXP,
                level: newLevel,
                leveledUp,
                amount,
                roleName: newRoleName
            });
        };

        const result = tx ? await executeUpdate(tx) : await prisma.$transaction(executeUpdate);

        if (result.success) {
            // Notify User of XP Award (Async)
            createNotification({
                recipientId: userId,
                senderId: "system",
                type: "xp_award",
                details: { amount, reason: reason.replace(/_/g, ' ') }
            }).catch(e => console.error("XP Notification Error:", e));

            revalidatePath("/");
            revalidatePath("/dashboard");
        }

        return result;

    } catch (error: any) {
        console.error("Error awarding XP:", error);
        return serializeForClient({ success: false, error: error.message || "Failed to award XP" });
    }
}

export async function updateExplorationProgress(userId: string, progressToAdd: number) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId }, select: { explorationProgress: true } });
            if (!user) return serializeForClient({ success: false, error: "User not found" });

            const current = user.explorationProgress || 0;
            if (current >= 100) return { success: true, progress: current };

            const newProgress = Math.min(current + progressToAdd, 100);

            await tx.user.update({
                where: { id: userId },
                data: { explorationProgress: newProgress }
            });

            return serializeForClient({ success: true, progress: newProgress });
        });

        return result;

    } catch (error) {
        console.error("Error updating exploration:", error);
        return serializeForClient({ success: false });
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

        // Award Rewards from definition
        if (badgeDef.xpReward) {
            await awardXP(userId, badgeDef.xpReward, `badge_${badgeId}`, tx);
        }
        if ((badgeDef as any).runesReward) {
            await awardRunes(userId, (badgeDef as any).runesReward, `badge_${badgeId}`, tx);
        }

        // Award Visibility & Notifications
        if (badgeId === "tycoon") {
            createActivity(userId, "achievement", {
                achievementTitle: "Tycoon",
                description: "Unlocked every item in the shop! 👑",
                badgeIcon: "👑"
            }).catch(e => console.error("Tycoon Activity Error:", e));

            // Dedicated Achievement Notification
            createNotification({
                recipientId: userId,
                senderId: "system",
                type: "achievement",
                details: {
                    achievementTitle: "Tycoon",
                    description: "Unlocked every item in the shop! 👑",
                    icon: "👑"
                }
            }).catch(e => console.error("Achievement Notification Error:", e));
        } else {
            createActivity(userId, "badge_awarded", {
                badgeName: badgeDef.name,
                badgeIcon: badgeDef.icon,
                description: `Earned the ${badgeDef.name} badge!`
            }).catch(e => console.error("Badge Activity Error:", e));
        }

        createNotification({
            recipientId: userId,
            senderId: "system",
            type: "badge_awarded",
            details: { badgeName: badgeDef.name, badgeIcon: badgeDef.icon }
        }).catch(e => console.error("Badge Notification Error:", e));

        return serializeForClient({ success: true, badge: newBadge });

    } catch (error) {
        console.error("Error awarding badge:", error);
    }
}

export async function trackProjectView(userId: string, projectId: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check if already viewed
            const existingView = await tx.projectView.findUnique({
                where: {
                    userId_projectId: {
                        userId,
                        projectId
                    }
                }
            });

            if (existingView) return; // Already viewed, do nothing

            // 2. Create ProjectView
            await tx.projectView.create({
                data: {
                    userId,
                    projectId
                }
            });

            // 3. Count total views for user
            const viewCount = await tx.projectView.count({
                where: { userId }
            });

            // 4. Check thresholds and award (Rewards now handled inside checkAndAwardBadge)
            let awardedBadge = null;
            // Observer (10 views)
            if (viewCount === 10) {
                const res = await checkAndAwardBadge(userId, "observer", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Scout (50 views)
            else if (viewCount === 50) {
                const res = await checkAndAwardBadge(userId, "scout", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Surveyor (100 views)
            else if (viewCount === 100) {
                const res = await checkAndAwardBadge(userId, "surveyor", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Visionary (500 views)
            else if (viewCount === 500) {
                const res = await checkAndAwardBadge(userId, "visionary", tx);
                if (res?.success) awardedBadge = res.badge;
            }

            // 5. Update gamificationState with view count for UI progress
            const state: any = (await tx.user.findUnique({ where: { id: userId }, select: { gamificationState: true } }))?.gamificationState || {};
            state.viewCount = viewCount;
            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });

            return { success: true, awardedBadge };
        });

        return serializeForClient(result);
    } catch (e) {
        console.error("Error tracking view:", e);
        return serializeForClient({ success: false });
    }
}

export async function trackContactMessage(userId: string) {
    try {
        // Award 100 XP for contacting/hiring (Limit once per day usually, or unique per message if we track message ID)
        // For now, let's limit to once per day to prevent spamming the form for XP
        await awardXP(userId, 100, "daily_contact_message");

        return await checkAndAwardBadge(userId, "connector");

    } catch (e) {
        console.error("Error tracking message:", e);
    }
}

export async function trackDeepThinker(userId: string, projectId?: string) {
    // Called when user scrolls to end of a "Case Study" or any project
    try {
        // Award 25 XP for reading a case study (Once per project per day)
        if (projectId) {
            await awardXP(userId, 25, `read_case_study_${projectId}`);
        }

        const result = await prisma.$transaction(async (tx) => {
            let awardedBadge = null;
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { gamificationState: true }
            });

            if (!user) return { success: false };
            const state: any = user.gamificationState || { readCount: 0 };
            state.readCount = (state.readCount || 0) + 1;

            // Update state FIRST
            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });

            if (state.readCount === 3) {
                const res = await checkAndAwardBadge(userId, "deep_thinker", tx);
                if (res?.success) awardedBadge = res.badge;
            }

            return { success: true, awardedBadge };
        });

        return serializeForClient(result);
    } catch (e) {
        console.error(e);
    }
}

// Track Comment (Social Butterfly)
export async function trackComment(userId: string, projectId?: string) {
    try {
        // limit 5 XP awards per day for commenting -> Now 40 XP
        // STRICT RULE: Award XP only for Project comments
        // STRICT RULE: Award XP only for Project comments
        let xpResult;
        if (projectId) {
            xpResult = await awardXP(userId, 40, `comment_project_${projectId}_${Date.now()}`);
        }

        // Track for badge (Social Butterfly) - counts all comments
        const result = await prisma.$transaction(async (tx) => {
            let awardedBadge = null;
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { gamificationState: true }
            });
            if (!user) return;

            const state: any = user.gamificationState || {};
            state.commentCount = (state.commentCount || 0) + 1;

            // Track Unique Project Comments
            if (projectId) {
                if (!state.commentedProjects) state.commentedProjects = [];
                if (!state.commentedProjects.includes(projectId)) {
                    state.commentedProjects.push(projectId);
                }

                const uniqueComments = state.commentedProjects.length;

                // Scribe (10 comments)
                if (uniqueComments === 10) {
                    const res = await checkAndAwardBadge(userId, "scribe", tx);
                    if (res?.success) awardedBadge = res.badge;
                }
                // Bard (50 comments)
                else if (uniqueComments === 50) {
                    const res = await checkAndAwardBadge(userId, "bard", tx);
                    if (res?.success) awardedBadge = res.badge;
                }
                // Chronicler (100 comments)
                else if (uniqueComments === 100) {
                    const res = await checkAndAwardBadge(userId, "chronicler", tx);
                    if (res?.success) awardedBadge = res.badge;
                }
                // Oracle (500 comments)
                else if (uniqueComments === 500) {
                    const res = await checkAndAwardBadge(userId, "oracle", tx);
                    if (res?.success) awardedBadge = res.badge;
                }
            }

            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });

            if (state.commentCount === 5) {
                const res = await checkAndAwardBadge(userId, "social_butterfly", tx);
                if (res?.success) awardedBadge = res.badge;
            }

            return { success: true, awardedBadge };
        });

        return result;
    } catch (e) {
        console.error("Error tracking comment:", e);
    }
}

export async function trackLikeReceived(authorId: string) {
    try {
        // limit 10 XP awards per day for receiving likes
        const xpResult = await awardXP(authorId, 2, "daily_like_received");

        // Track for badge (Trendsetter)
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: authorId },
                select: { gamificationState: true }
            });
            if (!user) return;

            const state: any = user.gamificationState || {};
            state.likeReceivedCount = (state.likeReceivedCount || 0) + 1;

            await tx.user.update({
                where: { id: authorId },
                data: { gamificationState: state }
            });

            if (state.likeReceivedCount >= 10) {
                await checkAndAwardBadge(authorId, "trendsetter", tx);
            }
        });

        return xpResult;
    } catch (e) {
        console.error("Error tracking like received:", e);
    }
}

export async function trackNightOwl(userId: string) {
    try {
        const now = new Date();
        const hour = now.getHours();

        // Between 00:00 (12 AM) and 04:00 (4 AM)
        if (hour >= 0 && hour < 4) {
            await checkAndAwardBadge(userId, "night_owl");
        }
    } catch (e) {
        console.error("Error tracking night owl:", e);
    }
}

export async function trackLike(userId: string, projectId: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            let awardedBadge = null;
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { gamificationState: true, badges: true }
            });

            if (!user) return { success: false };

            const state: any = user.gamificationState || {};

            // Track Unique Liked Projects
            if (!state.likedProjects) state.likedProjects = [];
            if (!state.likedProjects.includes(projectId)) {
                state.likedProjects.push(projectId);
            }

            const uniqueLikes = state.likedProjects.length;

            // Admirer (10 likes)
            if (uniqueLikes === 10) {
                const res = await checkAndAwardBadge(userId, "admirer", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Fan (50 likes)
            else if (uniqueLikes === 50) {
                const res = await checkAndAwardBadge(userId, "fan", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Curator (100 likes)
            else if (uniqueLikes === 100) {
                const res = await checkAndAwardBadge(userId, "curator", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Patron (500 likes)
            else if (uniqueLikes === 500) {
                const res = await checkAndAwardBadge(userId, "patron", tx);
                if (res?.success) awardedBadge = res.badge;
            }

            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });

            return { success: true, awardedBadge };
        });

        return serializeForClient(result);
    } catch (e) {
        console.error("Error tracking like:", e);
        return { success: false };
    }
}

export async function trackShopCompletion(userId: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            let awardedBadge = null;
            // 1. Get total shop item count
            const totalShopItems = await tx.shopItem.count();
            if (totalShopItems === 0) return { success: false }; // Should not happen in prod

            // 2. Get user inventory count (unique items)
            const userInventoryCount = await tx.userInventory.count({
                where: { userId }
            });

            // 3. Check if completed
            if (userInventoryCount >= totalShopItems) {
                // Award Badge
                const badgeResult = await checkAndAwardBadge(userId, "tycoon", tx);

                if (badgeResult?.success) {
                    awardedBadge = badgeResult.badge;
                    return { success: true, awarded: true, awardedBadge };
                }
            }
            return { success: true, awarded: false };
        });

        return serializeForClient(result);
    } catch (error) {
        console.error("Error tracking shop completion:", error);
        return serializeForClient({ success: false });
    }
}

export async function trackFirstShopPurchase(userId: string) {
    try {
        const result = await prisma.$transaction(async (tx: any) => {
            // Check if already awarded
            const user = await tx.user.findUnique({ where: { id: userId }, select: { badges: true } });
            const badges = (user?.badges as any[]) || [];
            if (badges.some((b: any) => b.id === "first_purchase")) return { success: false };

            const res = await checkAndAwardBadge(userId, "first_purchase", tx);
            return { success: true, awardedBadge: res?.badge };
        });
        return serializeForClient(result);
    } catch (e) {
        console.error("Error tracking first purchase:", e);
    }
}

export async function trackFirstBannerSetup(userId: string) {
    try {
        const result = await prisma.$transaction(async (tx: any) => {
            // Check if already awarded
            const user = await tx.user.findUnique({ where: { id: userId }, select: { badges: true } });
            const badges = (user?.badges as any[]) || [];
            if (badges.some((b: any) => b.id === "first_banner")) return { success: false };

            const res = await checkAndAwardBadge(userId, "first_banner", tx);
            return { success: true, awardedBadge: res?.badge };
        });
        return serializeForClient(result);
    } catch (e) {
        console.error("Error tracking first banner:", e);
    }
}

export async function trackProfileVisit(visitorId: string, targetUserId: string) {
    if (visitorId === targetUserId) return; // Don't track self-visits

    try {
        const result = await prisma.$transaction(async (tx: any) => {
            let awardedBadge = null;
            // 1. Check/Create Visit Record
            // We use upsert or ignore if exists. Since we need to know if it's NEW, try create.
            const existingVisit = await tx.profileVisit.findUnique({
                where: {
                    visitorId_targetUserId: {
                        visitorId,
                        targetUserId
                    }
                }
            });

            if (existingVisit) return; // Already visited this profile

            // Create new visit
            await tx.profileVisit.create({
                data: {
                    visitorId,
                    targetUserId
                }
            });

            // 2. Count total unique profile visits
            const visitCount = await tx.profileVisit.count({
                where: { visitorId }
            });

            // 3. Check Thresholds
            // First Visit (1 visit)
            if (visitCount === 1) {
                const res = await checkAndAwardBadge(visitorId, "first_visit", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Social Explorer (10 visits)
            else if (visitCount === 10) {
                const res = await checkAndAwardBadge(visitorId, "social_explorer", tx);
                if (res?.success) awardedBadge = res.badge;
            }
            // Community Pillar (50 visits)
            else if (visitCount === 50) {
                const res = await checkAndAwardBadge(visitorId, "community_pillar", tx);
                if (res?.success) awardedBadge = res.badge;
            }

            // 4. Update gamificationState for progress UI
            const state: any = (await tx.user.findUnique({ where: { id: visitorId }, select: { gamificationState: true } }))?.gamificationState || {};
            state.profileVisitsCount = visitCount;
            await tx.user.update({
                where: { id: visitorId },
                data: { gamificationState: state }
            });

            return { success: true, awardedBadge };
        });

        return serializeForClient(result);
    } catch (e) {
        console.error("Error tracking profile visit:", e);
    }
}
