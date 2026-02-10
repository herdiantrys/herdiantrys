"use server";

import { auth } from "@/auth";
import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";

export async function toggleLike(projectId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Check if the user has already liked the project
    const query = `count(*[_type == "project" && _id == $projectId && $userId in likes[]._ref])`;
    const params = { projectId, userId };
    const count = await writeClient.fetch(query, params);
    const isLiked = count > 0;

    try {
        if (isLiked) {
            // Unlike: Remove the user reference from the likes array
            await writeClient
                .patch(projectId)
                .unset([`likes[_ref == "${userId}"]`])
                .commit();
        } else {
            // Like: Add the user reference to the likes array
            await writeClient
                .patch(projectId)
                .setIfMissing({ likes: [] })
                .append("likes", [{ _type: "reference", _ref: userId, _key: crypto.randomUUID() }])
                .commit();
        }

        revalidatePath("/");
        return { success: true, isLiked: !isLiked };
    } catch (error) {
        console.error("Error toggling like:", error);
        return { success: false, error: "Failed to toggle like" };
    }
}
