"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function incrementViews(projectId: string) {
    try {
        await writeClient
            .patch(projectId)
            .inc({ views: 1 })
            .commit();
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
        const project = await writeClient.getDocument(projectId);
        const likes = project?.likes || [];
        const hasLiked = likes.some((ref: any) => ref._ref === userId);

        if (hasLiked) {
            // Remove like
            await writeClient
                .patch(projectId)
                .unset([`likes[_ref=="${userId}"]`])
                .commit();
        } else {
            // Add like
            await writeClient
                .patch(projectId)
                .setIfMissing({ likes: [] })
                .append("likes", [{ _type: "reference", _ref: userId }])
                .commit();
        }

        revalidatePath(`/works/${projectId}`);
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
        await writeClient.create({
            _type: "comment",
            text,
            project: { _type: "reference", _ref: projectId },
            user: { _type: "reference", _ref: session.user.id },
            createdAt: new Date().toISOString(),
        });

        revalidatePath(`/works/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Error posting comment:", error);
        return { error: "Failed to post comment" };
    }
}
