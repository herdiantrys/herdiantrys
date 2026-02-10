"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const updateUserPoints = async (userId: string, points: number) => {
    try {
        const session = await auth();

        // Strict Role Check
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return { success: false, error: "Unauthorized: Super Admin access required" };
        }

        if (!userId) return { success: false, error: "User ID required" };
        if (points < 0) return { success: false, error: "Points cannot be negative" };

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { points }
        });

        revalidatePath("/admin/users");

        return { success: true, points: updatedUser.points };

    } catch (error: any) {
        console.error("Error updating user points:", error);
        return { success: false, error: error.message };
    }
};
