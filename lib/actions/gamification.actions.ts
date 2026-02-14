"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { LEVELS, BADGES } from "@/lib/constants/gamification";
import { getRanks } from "@/lib/actions/rank.actions"; // Import rank actions
import { createNotification } from "./notification.actions";
import { createActivity } from "./activity.actions";

// using Prisma.TransactionClient directly

export async function awardXP(userId: string, amount: number, reason: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
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
                return { success: false, limitReached: true, message: "Daily limit reached for this action." };
            }

            // Update limit for today
            state.dailyLimits[reason] = today;

            const newXP = (user.xp || 0) + amount;

            // Calculate new level (1 Level per 100 XP)
            const newLevel = Math.floor(newXP / 100) + 1;

            // Fetch Ranks from DB
            const dbRanks = await tx.rank.findMany({ orderBy: { minXP: 'asc' } });
            // Fallback to constants if DB empty? Or assume seeded.
            // If strictly using DB, no fallback needed if seeded correctly.

            // Find current rank based on newXP
            // We need to find the highest rank where minXP <= newXP
            // Since sorted asc, we can reverse or findLast (if avail) or just iterate
            const reversedRanks = [...dbRanks].reverse();
            const currentRank = reversedRanks.find(r => newXP >= r.minXP) || dbRanks[0]; // Default to lowest if found none (should not happen if minXP=0 exists)

            const newRoleName = currentRank?.name || "Visitor";

            const leveledUp = newLevel > (user.level || 1);

            // Update User
            await tx.user.update({
                where: { id: userId },
                data: {
                    xp: newXP,
                    level: newLevel,
                    gamificationState: state
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

        // Award Visibility & Notifications
        if (badgeId === "tycoon") {
            createActivity(userId, "achievement", {
                achievementTitle: "Tycoon",
                description: "Unlocked every item in the shop! 👑",
                badgeIcon: "👑"
            }).catch(e => console.error("Tycoon Activity Error:", e));
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

        return { success: true, badge: newBadge };

    } catch (error) {
        console.error("Error awarding badge:", error);
    }
}

export async function trackProjectView(userId: string, projectId: string) {
    try {
        await prisma.$transaction(async (tx) => {
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

            // 4. Check thresholds and award
            // Observer (10 views) - 100 XP
            if (viewCount === 10) {
                await awardXP(userId, 100, "achievement_observer");
                await checkAndAwardBadge(userId, "observer", tx);
            }
            // Scout (50 views) - 600 XP
            else if (viewCount === 50) {
                await awardXP(userId, 600, "achievement_scout");
                await checkAndAwardBadge(userId, "scout", tx);
            }
            // Surveyor (100 views) - 1200 XP
            else if (viewCount === 100) {
                await awardXP(userId, 1200, "achievement_surveyor");
                await checkAndAwardBadge(userId, "surveyor", tx);
            }
            // Visionary (500 views) - 6000 XP
            else if (viewCount === 500) {
                await awardXP(userId, 6000, "achievement_visionary");
                await checkAndAwardBadge(userId, "visionary", tx);
            }
            // 5. Update gamificationState with view count for UI progress
            const state: any = (await tx.user.findUnique({ where: { id: userId }, select: { gamificationState: true } }))?.gamificationState || {};
            state.viewCount = viewCount;
            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });
        });

        return { success: true };
    } catch (e) {
        console.error("Error tracking view:", e);
        return { success: false };
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

export async function trackDeepThinker(userId: string, projectId: string) {
    // Called when user scrolls to end of a "Case Study" or any project
    try {
        // Award 25 XP for reading a case study (Once per project per day)
        if (projectId) {
            await awardXP(userId, 25, `read_case_study_${projectId}`);
        }

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
        await prisma.$transaction(async (tx) => {
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

                // Scribe (10 comments) - 150 XP
                if (uniqueComments === 10) {
                    await awardXP(userId, 150, "achievement_scribe");
                    await checkAndAwardBadge(userId, "scribe", tx);
                }
                // Bard (50 comments) - 700 XP
                else if (uniqueComments === 50) {
                    await awardXP(userId, 700, "achievement_bard");
                    await checkAndAwardBadge(userId, "bard", tx);
                }
                // Chronicler (100 comments) - 1500 XP
                else if (uniqueComments === 100) {
                    await awardXP(userId, 1500, "achievement_chronicler");
                    await checkAndAwardBadge(userId, "chronicler", tx);
                }
                // Oracle (500 comments) - 7000 XP
                else if (uniqueComments === 500) {
                    await awardXP(userId, 7000, "achievement_oracle");
                    await checkAndAwardBadge(userId, "oracle", tx);
                }
            }

            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });

            if (state.commentCount >= 5) {
                await checkAndAwardBadge(userId, "social_butterfly", tx);
            }
        });

        return xpResult;
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
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { gamificationState: true, badges: true }
            });

            if (!user) return;

            const state: any = user.gamificationState || {};

            // Track Unique Liked Projects
            if (!state.likedProjects) state.likedProjects = [];
            if (!state.likedProjects.includes(projectId)) {
                state.likedProjects.push(projectId);
            }

            const uniqueLikes = state.likedProjects.length;

            // Admirer (10 likes) - 125 XP
            if (uniqueLikes === 10) {
                await awardXP(userId, 125, "achievement_admirer");
                await checkAndAwardBadge(userId, "admirer", tx);
            }
            // Fan (50 likes) - 650 XP
            else if (uniqueLikes === 50) {
                await awardXP(userId, 650, "achievement_fan");
                await checkAndAwardBadge(userId, "fan", tx);
            }
            // Curator (100 likes) - 1300 XP
            else if (uniqueLikes === 100) {
                await awardXP(userId, 1300, "achievement_curator");
                await checkAndAwardBadge(userId, "curator", tx);
            }
            // Patron (500 likes) - 6500 XP
            else if (uniqueLikes === 500) {
                await awardXP(userId, 6500, "achievement_patron");
                await checkAndAwardBadge(userId, "patron", tx);
            }

            await tx.user.update({
                where: { id: userId },
                data: { gamificationState: state }
            });
        });

        return { success: true };
    } catch (e) {
        console.error("Error tracking like:", e);
        return { success: false };
    }
}

export async function trackShopCompletion(userId: string) {
    try {
        const result = await prisma.$transaction(async (tx) => {
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

                // Award Bonus XP for completion (e.g. 5000 XP)
                if (badgeResult?.success) {
                    await awardXP(userId, 5000, "achievement_tycoon");
                    return { success: true, awarded: true };
                }
            }
            return { success: true, awarded: false };
        });

        return result;
    } catch (error) {
        console.error("Error tracking shop completion:", error);
        return { success: false };
    }
}

export async function trackFirstShopPurchase(userId: string) {
    try {
        await prisma.$transaction(async (tx: any) => {
            // Check if already awarded
            const user = await tx.user.findUnique({ where: { id: userId }, select: { badges: true } });
            const badges = (user?.badges as any[]) || [];
            if (badges.some((b: any) => b.id === "first_purchase")) return;

            // Award Badge & XP (100XP)
            // Note: Since this is called AFTER a purchase, we assume the purchase was successful.
            // We could verify inventory count > 0, but the caller should ensure a purchase happened.
            await awardXP(userId, 100, "achievement_first_purchase");
            await checkAndAwardBadge(userId, "first_purchase", tx);
        });
    } catch (e) {
        console.error("Error tracking first purchase:", e);
    }
}

export async function trackFirstBannerSetup(userId: string) {
    try {
        await prisma.$transaction(async (tx: any) => {
            // Check if already awarded
            const user = await tx.user.findUnique({ where: { id: userId }, select: { badges: true } });
            const badges = (user?.badges as any[]) || [];
            if (badges.some((b: any) => b.id === "first_banner")) return;

            // Award Badge & XP (100XP)
            await awardXP(userId, 100, "achievement_first_banner");
            await checkAndAwardBadge(userId, "first_banner", tx);
        });
    } catch (e) {
        console.error("Error tracking first banner:", e);
    }
}

export async function trackProfileVisit(visitorId: string, targetUserId: string) {
    if (visitorId === targetUserId) return; // Don't track self-visits

    try {
        await prisma.$transaction(async (tx: any) => {
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
            // First Visit (1 visit) - 50 XP
            if (visitCount === 1) {
                await awardXP(visitorId, 50, "achievement_first_visit");
                await checkAndAwardBadge(visitorId, "first_visit", tx);
            }
            // Social Explorer (10 visits) - 350 XP
            else if (visitCount === 10) {
                await awardXP(visitorId, 350, "achievement_social_explorer");
                await checkAndAwardBadge(visitorId, "social_explorer", tx);
            }
            // Community Pillar (50 visits) - 1000 XP
            else if (visitCount === 50) {
                await awardXP(visitorId, 1000, "achievement_community_pillar");
                await checkAndAwardBadge(visitorId, "community_pillar", tx);
            }

            // 4. Update gamificationState for progress UI
            const state: any = (await tx.user.findUnique({ where: { id: visitorId }, select: { gamificationState: true } }))?.gamificationState || {};
            state.profileVisitsCount = visitCount;
            await tx.user.update({
                where: { id: visitorId },
                data: { gamificationState: state }
            });

        });
    } catch (e) {
        console.error("Error tracking profile visit:", e);
    }
}
