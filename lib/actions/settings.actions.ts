"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeForClient } from "@/lib/utils";

import { ThemeConfig, DEFAULT_THEME } from "@/lib/types/theme";
import { applyColorRule603010 } from "@/lib/theme-color-rule";

const isMissingTableError = (error: unknown, modelName: string) => {
    return error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === "P2021"
        && typeof error.meta?.modelName === "string"
        && error.meta.modelName === modelName;
};

export const getGlobalTheme = async (): Promise<ThemeConfig> => {
    try {
        const setting = await prisma.globalSetting.findUnique({
            where: { id: "main" }
        });

        if (!setting || !setting.theme) {
            return applyColorRule603010(DEFAULT_THEME);
        }

        return applyColorRule603010({
            ...DEFAULT_THEME,
            ...serializeForClient(setting.theme as ThemeConfig),
        });
    } catch (error) {
        if (isMissingTableError(error, "GlobalSetting")) {
            return applyColorRule603010(DEFAULT_THEME);
        }

        console.error("Error fetching theme:", error);
        return applyColorRule603010(DEFAULT_THEME);
    }
};

export const updateGlobalTheme = async (theme: ThemeConfig) => {
    try {
        const themeData = applyColorRule603010(theme) as Prisma.InputJsonObject;

        // Validation: Ensure the user is a SUPER_ADMIN could be added here or in the page
        await prisma.globalSetting.upsert({
            where: { id: "main" },
            update: { theme: themeData },
            create: { id: "main", theme: themeData }
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        if (isMissingTableError(error, "GlobalSetting")) {
            return { success: false, error: "Database schema is not initialized yet. Run Prisma sync first." };
        }

        console.error("Error updating theme:", error);
        return { success: false, error: "Failed to update theme" };
    }
};

export type UserPreferences = {
    language: string;
    [key: string]: unknown;
};

export const updatePreferences = async (userId: string, preferences: UserPreferences) => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        const currentPrefs = (currentUser?.preferences as Record<string, unknown>) || {};
        const mergedPrefs = {
            ...currentPrefs,
            ...preferences
        } as Prisma.InputJsonObject;

        await prisma.user.update({
            where: { id: userId },
            data: {
                preferences: mergedPrefs
            }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating preferences:", error);
        return { success: false, error: "Failed to update preferences" };
    }
};
