"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";
import { auth } from "@/auth";
import { trackLikeReceived, awardXP } from "./gamification.actions";

export const toggleLike = async (targetId: string, targetType: "project" | "user" | "post" = "project") => {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

        let isLiked = false;
        let recipientId = "";

        // 1. Handle POST likes
        if (targetType === "post") {
            const post = await prisma.post.findUnique({
                where: { id: targetId },
                include: {
                    likedBy: { where: { id: userId } }, // Check if user ID is in likedBy list
                    author: true
                }
            });

            if (!post) return { success: false, error: "Post not found" };

            recipientId = post.authorId;
            isLiked = post.likedBy.length > 0;

            if (isLiked) {
                // Unlike
                await prisma.post.update({
                    where: { id: targetId },
                    data: { likedBy: { disconnect: { id: userId } } }
                });
            } else {
                // Like
                await prisma.post.update({
                    where: { id: targetId },
                    data: { likedBy: { connect: { id: userId } } }
                });
            }
        }

        // 2. Handle PROJECT likes
        else if (targetType === "project") {
            const project = await prisma.project.findUnique({
                where: { id: targetId },
                include: {
                    likedBy: { where: { id: userId } },
                    author: true // Usually admin, but consistent
                }
            });

            if (!project) return { success: false, error: "Project not found" };

            recipientId = project.authorId;
            isLiked = project.likedBy.length > 0;

            if (isLiked) {
                await prisma.project.update({
                    where: { id: targetId },
                    data: { likedBy: { disconnect: { id: userId } } }
                });
            } else {
                await prisma.project.update({
                    where: { id: targetId },
                    data: { likedBy: { connect: { id: userId } } }
                });
            }
        }

        // 3. Handle USER likes (if applicable, though schema doesn't support generic user likes yet)
        else if (targetType === "user") {
            // Placeholder: User likes not fully implemented in schema relation
            // If we really need it, we'd add 'likedUsers' relation.
            console.warn("User like not implemented in Prisma schema yet.");
            return { success: false, error: "Not implemented for User type" };
        }

        // Trigger Notification (only on Like)
        if (!isLiked && recipientId && recipientId !== userId) {
            await createNotification({
                recipientId,
                senderId: userId,
                type: 'like_post', // We can genericize if needed, usually 'like_post' covers both in UI?
                relatedPostId: targetType === 'post' ? targetId : undefined,
                relatedProjectId: targetType === 'project' ? targetId : undefined
            });

            // Gamification Hook: Reward the Author for receiving a like
            await trackLikeReceived(recipientId);
        }

        revalidatePath("/dashboard");
        revalidatePath("/saved");
        revalidatePath("/notifications");
        // Also revalidate specific pages
        revalidatePath("/");
        revalidatePath("/");
        revalidatePath("/projects");
        revalidatePath("/works");
        if (targetType === 'project') {
            // Revalidate dynamic project pages if needed, though simpler is usually better
        }

        if (!isLiked) {
            // Award 10 XP for liking (Limit once per item per day via unique reason)
            // STRICT RULE: Only award XP for Project interactions
            if (targetType === 'project') {
                await awardXP(userId, 10, `like_${targetType}_${targetId}`);

                // Track "Liker" Achievements (Admirer, Fan, etc.)
                const { trackLike } = await import("./gamification.actions");
                await trackLike(userId, targetId);
            }
        }

        return { success: true, isLiked: !isLiked };
    } catch (error) {
        console.error("Error toggling like:", error);
        return { success: false, error: "Failed to toggle like" };
    }
};
