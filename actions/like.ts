"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";

export async function toggleLike(projectId: string, userId: string) {
    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const project = await writeClient.fetch(
            `*[_type == "project" && _id == $projectId][0] {
                "isLiked": count(likes[@._ref == $userId]) > 0
            }`,
            { projectId, userId }
        );

        if (project?.isLiked) {
            // Unlike
            await writeClient
                .patch(projectId)
                .unset([`likes[_ref == "${userId}"]`])
                .commit();
        } else {
            // Like
            await writeClient
                .patch(projectId)
                .setIfMissing({ likes: [] })
                .append("likes", [{ _type: "reference", _ref: userId }])
                .commit();
        }

        revalidatePath("/");
        revalidatePath(`/projects/${projectId}`); // Revalidate specific project page if needed

        return { success: true };
    } catch (error) {
        console.error("Toggle like error:", error);
        return { error: "Failed to update like status" };
    }
}
