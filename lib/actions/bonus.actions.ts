"use server";

import prisma from "@/lib/prisma";
import { createNotification } from "./notification.actions";
import { revalidatePath } from "next/cache";

export const checkAndAwardSessionBonus = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { lastSessionRewardClaimedAt: true, points: true }
        });

        if (!user) return { success: false, error: "User not found" };

        const now = new Date();
        const lastClaim = user.lastSessionRewardClaimedAt;

        // Check if 10 minutes have passed (10 * 60 * 1000 = 600000 ms)
        // If never claimed, they are eligible immediately (or could set a rule to wait first, but typically user friendly to give first one soon or immediately upon session requirements met)
        // However, the client calls this only after tracking 10 mins.
        // Server side must create a "minimum gap" if we want to prevent spam if user clears localstorage.
        // But since we want "10 mins Session", and we don't track session time on server easily without sockets,
        // we will rely on "Last Claim Time + 10 mins". 
        // IF user has never claimed, they can claim.
        // AFTER that, must wait 10 mins.

        const MIN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

        // Check if already claimed TODAY
        if (lastClaim) {
            const lastClaimDate = new Date(lastClaim);
            const isSameDay =
                lastClaimDate.getDate() === now.getDate() &&
                lastClaimDate.getMonth() === now.getMonth() &&
                lastClaimDate.getFullYear() === now.getFullYear();

            if (isSameDay) {
                return { success: false, error: "Daily bonus already claimed." };
            }
        }

        const BONUS_AMOUNT = 50;

        await prisma.user.update({
            where: { id: userId },
            data: {
                lastSessionRewardClaimedAt: now,
                points: { increment: BONUS_AMOUNT }
            }
        });

        await createNotification({
            recipientId: userId,
            senderId: userId, // Self-generated
            type: 'system',
            // details could be added if schema supports it, for now just type system
        });

        revalidatePath("/dashboard");
        revalidatePath(`/profile/${userId}`); // Revalidate profile to show points update

        return { success: true, awarded: true, message: `Daily Login! You received ${BONUS_AMOUNT} coins!` };

    } catch (error) {
        console.error("Error checking session bonus:", error);
        return { success: false, error: "Failed to check bonus" };
    }
};
