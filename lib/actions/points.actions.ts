"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const addPoints = async (userId: string, amount: number, reason: string) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { points: { increment: amount } }
        });

        // Log transaction if we had a Transaction model (future feature)

        revalidatePath("/dashboard");
        revalidatePath(`/profile/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Error adding points:", error);
        return { success: false, error: "Failed to add points" };
    }
};

export const deductPoints = async (userId: string, amount: number, reason: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true }
        });

        if (!user || user.points < amount) {
            return { success: false, error: "Insufficient points" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { points: { decrement: amount } }
        });

        revalidatePath("/dashboard");
        revalidatePath(`/user/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deducting points:", error);
        return { success: false, error: "Failed to deduct points" };
    }
};

export const getUserPoints = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true }
        });
        return user?.points || 0;
    } catch (error) {
        console.error("Error fetching user points:", error);
        return 0;
    }
};
