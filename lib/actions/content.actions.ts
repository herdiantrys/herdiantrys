"use server";

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeForClient } from "@/lib/utils";
import { i18n } from "@/i18n-config";
import { normalizeSocialLinks } from "@/lib/social-links";

const revalidateSiteContentPaths = () => {
    revalidatePath("/");
    for (const locale of i18n.locales) {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/admin/content`);
    }
};

export const getSiteContent = async () => {
    try {
        let content = await prisma.siteContent.findUnique({
            where: { id: "main" }
        });

        // Initialize if not exists
        if (!content) {
            // Migration logic: Attempt to fetch first admin to pre-populate?
            // Or just create empty. Let's create empty but with reasonable defaults if possible,
            // or leave it to the user to fill.
            // For smoother transition, let's try to copy from the first ADMIN if desired, 
            // but the user asked to SEPARATE. So starting fresh (or empty) might be cleaner,
            // BUT that would break the homepage immediately.
            // Better strategy: Try to find an admin user and copy their data once.

            const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

            content = await prisma.siteContent.create({
                data: {
                    id: "main",
                    fullName: adminUser?.name || "Your Name",
                    headline: adminUser?.headline,
                    bio: adminUser?.bio,
                    location: adminUser?.location,
                    website: adminUser?.website,
                    profileImage: adminUser?.image,
                    bannerImage: adminUser?.bannerImage,
                    socialLinks: normalizeSocialLinks(adminUser?.socialLinks || []),
                    skills: adminUser?.skills || [],
                    experience: adminUser?.experience || [],
                    education: adminUser?.education || []
                }
            });
        }

        return serializeForClient(content);
    } catch (error) {
        console.error("Error fetching site content:", error);
        return null;
    }
};

export const updateSiteContent = async (data: Record<string, unknown>) => {
    try {
        const asNullableString = (value: unknown) => {
            if (typeof value !== "string") return null;
            const trimmedValue = value.trim();
            return trimmedValue.length > 0 ? trimmedValue : null;
        };

        const cleanData: Prisma.SiteContentUpdateInput = {
            fullName: asNullableString(data.fullName),
            headline: asNullableString(data.headline),
            bio: asNullableString(data.bio),
            aboutTitle: asNullableString(data.aboutTitle),
            location: asNullableString(data.location),
            website: asNullableString(data.website),
            skills: (Array.isArray(data.skills) ? data.skills : []) as Prisma.InputJsonValue,
            experience: (Array.isArray(data.experience) ? data.experience : []) as Prisma.InputJsonValue,
            education: (Array.isArray(data.education) ? data.education : []) as Prisma.InputJsonValue,
            socialLinks: normalizeSocialLinks(Array.isArray(data.socialLinks) ? data.socialLinks : []) as Prisma.InputJsonValue,
        };

        await prisma.siteContent.update({
            where: { id: "main" },
            data: cleanData
        });

        revalidateSiteContentPaths();
        return { success: true };
    } catch (error) {
        console.error("Error updating site content:", error);
        return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
};

// Reuse image upload logic but target SiteContent
import { uploadLocalFile } from "@/lib/upload";

export const uploadSiteImage = async (type: "profile" | "banner", formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        const url = await uploadLocalFile(file, "site_content");

        const field = type === "profile" ? "profileImage" : "bannerImage";

        await prisma.siteContent.update({
            where: { id: "main" },
            data: { [field]: url }
        });

        revalidateSiteContentPaths();
        return { success: true, imageUrl: url };
    } catch (error) {
        console.error(`Error uploading site ${type} image:`, error);
        return { success: false, error: "Upload failed" };
    }
};
