"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
                    socialLinks: adminUser?.socialLinks || [],
                    skills: adminUser?.skills || [],
                    experience: adminUser?.experience || [],
                    education: adminUser?.education || []
                }
            });
        }

        return content;
    } catch (error) {
        console.error("Error fetching site content:", error);
        return null;
    }
};

export const updateSiteContent = async (data: any) => {
    try {
        // Clean data similar to user profile
        const cleanData = JSON.parse(JSON.stringify({
            fullName: data.fullName,
            headline: data.headline,
            bio: data.bio,
            aboutTitle: data.aboutTitle,
            location: data.location,
            website: data.website,
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || [],
            socialLinks: data.socialLinks || [],
            // Add image fields if they are passed as strings (URLs)
            // But usually images are uploaded separately or handled via state, 
            // if passed here they are likely just strings.
        }));

        await prisma.siteContent.update({
            where: { id: "main" },
            data: cleanData
        });

        revalidatePath("/"); // Homepage
        return { success: true };
    } catch (error: any) {
        console.error("Error updating site content:", error);
        return { success: false, error: error.message };
    }
};

// Reuse image upload logic but target SiteContent
import { writeClient } from "@/sanity/lib/write-client";

export const uploadSiteImage = async (type: "profile" | "banner", formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        const field = type === "profile" ? "profileImage" : "bannerImage";

        await prisma.siteContent.update({
            where: { id: "main" },
            data: { [field]: asset.url }
        });

        revalidatePath("/");
        return { success: true, imageUrl: asset.url };
    } catch (error) {
        console.error(`Error uploading site ${type} image:`, error);
        return { success: false, error: "Upload failed" };
    }
};
