"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type UserPreferences = {
    language: "en" | "id";
};

export const updatePreferences = async (userId: string, preferences: UserPreferences) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { preferences: preferences as any } // Cast to any or InputJsonValue
        });

        const cookieStore = await cookies();
        cookieStore.set("NEXT_LOCALE", preferences.language);

        revalidatePath("/dashboard");
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating preferences:", error);
        return { success: false, error: "Failed to update settings" };
    }
};
