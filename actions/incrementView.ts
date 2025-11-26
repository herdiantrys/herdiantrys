"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";

export async function incrementView(projectId: string) {
    try {
        await writeClient
            .patch(projectId)
            .setIfMissing({ views: 0 })
            .inc({ views: 1 })
            .commit();

        // We don't necessarily need to revalidate the whole path immediately for views
        // as it might be too frequent, but for now let's keep it simple.
        // revalidatePath("/"); 
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
}
