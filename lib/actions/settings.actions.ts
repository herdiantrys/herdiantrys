"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { ThemeConfig, DEFAULT_THEME } from "@/lib/types/theme";

export const getGlobalTheme = async (): Promise<ThemeConfig> => {
    try {
        const setting = await prisma.globalSetting.findUnique({
            where: { id: "main" }
        });

        if (!setting || !setting.theme) {
            return DEFAULT_THEME;
        }

        return setting.theme as ThemeConfig;
    } catch (error) {
        console.error("Error fetching theme:", error);
        return DEFAULT_THEME;
    }
};

export const updateGlobalTheme = async (theme: ThemeConfig) => {
    try {
        // Validation: Ensure the user is a SUPER_ADMIN could be added here or in the page
        await prisma.globalSetting.upsert({
            where: { id: "main" },
            update: { theme: theme as any },
            create: { id: "main", theme: theme as any }
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Error updating theme:", error);
        return { success: false, error: "Failed to update theme" };
    }
};

export type UserPreferences = {
    language: string;
    [key: string]: any;
};

export const updatePreferences = async (userId: string, preferences: UserPreferences) => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        const currentPrefs = (currentUser?.preferences as Record<string, any>) || {};

        await prisma.user.update({
            where: { id: userId },
            data: {
                preferences: {
                    ...currentPrefs,
                    ...preferences
                }
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating preferences:", error);
        return { success: false, error: "Failed to update preferences" };
    }
};
