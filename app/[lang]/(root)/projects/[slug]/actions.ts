"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function incrementViews(projectId: string, slug: string) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { views: { increment: 1 } }
        });
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
}

export async function toggleLike(projectId: string, slug: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // Check if already liked
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { likedBy: { where: { id: userId } } }
        });

        if (!project) {
            return { error: "Project not found" };
        }

        const hasLiked = project.likedBy.length > 0;

        if (hasLiked) {
            // Disconnect like
            await prisma.project.update({
                where: { id: projectId },
                data: { likedBy: { disconnect: { id: userId } } }
            });
        } else {
            // Connect like
            await prisma.project.update({
                where: { id: projectId },
                data: { likedBy: { connect: { id: userId } } }
            });
        }

        revalidatePath(`/projects/${slug}`);

        // Track Gamification (Only on Like)
        if (!hasLiked) { // If it was NOT liked before, it is liked now
            const { trackLike } = await import("@/lib/actions/gamification.actions"); // Dynamic import
            await trackLike(userId, projectId);

            // Also track Like Received for the author?
            // The project object here doesn't have authorId easily accessible without another query or include.
            // But existing logic might handle it elsewhere or we can add it later if needed.
            // For now, focus on "Liker" achievements.
        }

        return { success: true, hasLiked: !hasLiked };
    } catch (error) {
        console.error("Error toggling like:", error);
        return { error: "Failed to toggle like" };
    }
}

export async function postComment(projectId: string, slug: string, text: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    if (!text.trim()) {
        return { error: "Comment cannot be empty" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { status: true }
        });

        if (user?.status === "LIMITED") {
            return { error: "Your account has limited posting privileges." };
        }

        await prisma.comment.create({
            data: {
                text,
                userId: session.user.id,
                projectId: projectId
            }
        });

        // Track Gamification
        const { trackComment } = await import("@/lib/actions/gamification.actions"); // Dynamic import to avoid circular dep if any
        await trackComment(session.user.id, projectId);

        revalidatePath(`/projects/${slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error posting comment:", error);
        return { error: "Failed to post comment" };
    }
}
