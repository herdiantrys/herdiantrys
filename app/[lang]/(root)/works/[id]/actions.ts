"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function incrementViews(projectId: string) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { views: { increment: 1 } },
        });
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
}

export async function toggleLike(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { likedBy: { where: { id: userId } } },
        });

        if (!project) return { error: "Project not found" };

        const hasLiked = project.likedBy.length > 0;

        if (hasLiked) {
            // Remove like
            await prisma.project.update({
                where: { id: projectId },
                data: { likedBy: { disconnect: { id: userId } } },
            });
        } else {
            // Add like
            await prisma.project.update({
                where: { id: projectId },
                data: { likedBy: { connect: { id: userId } } },
            });
        }

        revalidatePath(`/works/${projectId}`);
        // Can optionally trigger gamification routines here or rely on the primary like action.
        return { success: true, hasLiked: !hasLiked };
    } catch (error) {
        console.error("Error toggling like:", error);
        return { error: "Failed to toggle like" };
    }
}

export async function postComment(projectId: string, text: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    if (!text.trim()) {
        return { error: "Comment cannot be empty" };
    }

    try {
        await prisma.comment.create({
            data: {
                text,
                projectId,
                userId: session.user.id,
            },
        });

        revalidatePath(`/works/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error posting comment:", error);
        return { error: "Failed to post comment" };
    }
}
