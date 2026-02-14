"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function incrementView(projectId: string) {
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { views: { increment: 1 } }
        });

        // Optional: Revalidate if needed, but views might updates frequently
        // revalidatePath("/"); 
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
}
