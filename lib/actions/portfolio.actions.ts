"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";

export const getPortfolioConfig = async (userId: string) => {
    try {
        const config = await prisma.portfolioConfig.findUnique({
            where: { userId }
        });
        return config;
    } catch (error) {
        console.error("Error fetching portfolio config:", error);
        return null;
    }
};

export const getPortfolioProjects = async (userId: string) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                authorId: userId,
                status: "PUBLISHED"
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                image: true,
                categoryId: true,
                category: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return projects;
    } catch (error) {
        console.error("Error fetching portfolio projects:", error);
        return [];
    }
};

export const updatePortfolioConfig = async (userId: string, data: any) => {
    try {
        // Verify user owns the SaaS Template item
        const userInventory = await prisma.userInventory.findFirst({
            where: {
                userId,
                shopItem: {
                    type: "SAAS_TEMPLATE"
                }
            }
        });

        if (!userInventory) {
            throw new Error("You must purchase the Portfolio Template to use this feature.");
        }

        const config = await prisma.portfolioConfig.upsert({
            where: { userId },
            create: {
                userId,
                // Branding
                displayName: data.displayName,
                logo: data.logo,
                // Colors
                secondaryColor: data.secondaryColor,
                accentColor: data.accentColor,
                textColor: data.textColor,

                // Hero
                showHero: data.showHero,
                heroTitle: data.heroTitle,
                heroDescription: data.heroDescription,
                heroImage: data.heroImage,
                // About
                showAbout: data.showAbout,
                aboutTitle: data.aboutTitle,
                aboutDescription: data.aboutDescription,
                aboutImage: data.aboutImage,
                // Works
                showWorks: data.showWorks,
                worksTitle: data.worksTitle,
                worksDescription: data.worksDescription,
                featuredProjectIds: data.featuredProjectIds,
                // Testimony
                showTestimony: data.showTestimony,
                testimonyTitle: data.testimonyTitle,
                testimonyContent: data.testimonyContent,
                // Contact
                showContact: data.showContact,
                contactTitle: data.contactTitle,
                contactEmail: data.contactEmail,
                showResume: data.showResume,
                location: data.location,
                googleMapsUrl: data.googleMapsUrl,
                socials: data.socials,

                // Style
                layoutType: data.layoutType,
                primaryColor: data.primaryColor,
                fontFamily: data.fontFamily,

                // Advanced Customization
                heroAlign: data.heroAlign,
                gridCols: parseInt(data.gridCols) || 3,
                borderRadius: data.borderRadius,
                glassIntensity: data.glassIntensity,
                animationStyle: data.animationStyle,
                bgPattern: data.bgPattern,

                domain: data.domain,
                isEnabled: data.isEnabled
            },
            update: {
                // Branding
                displayName: data.displayName,
                logo: data.logo,
                // Colors
                secondaryColor: data.secondaryColor,
                accentColor: data.accentColor,
                textColor: data.textColor,

                // Hero
                showHero: data.showHero,
                heroTitle: data.heroTitle,
                heroDescription: data.heroDescription,
                heroImage: data.heroImage,
                // About
                showAbout: data.showAbout,
                aboutTitle: data.aboutTitle,
                aboutDescription: data.aboutDescription,
                aboutImage: data.aboutImage,
                // Works
                showWorks: data.showWorks,
                worksTitle: data.worksTitle,
                worksDescription: data.worksDescription,
                featuredProjectIds: data.featuredProjectIds,
                // Testimony
                showTestimony: data.showTestimony,
                testimonyTitle: data.testimonyTitle,
                testimonyContent: data.testimonyContent,
                // Contact
                showContact: data.showContact,
                contactTitle: data.contactTitle,
                contactEmail: data.contactEmail,
                showResume: data.showResume,
                location: data.location,
                googleMapsUrl: data.googleMapsUrl,
                socials: data.socials,

                // Style
                layoutType: data.layoutType,
                primaryColor: data.primaryColor,
                fontFamily: data.fontFamily,

                // Advanced Customization
                heroAlign: data.heroAlign,
                gridCols: parseInt(data.gridCols) || 3,
                borderRadius: data.borderRadius,
                glassIntensity: data.glassIntensity,
                animationStyle: data.animationStyle,
                bgPattern: data.bgPattern,

                domain: data.domain,
                isEnabled: data.isEnabled
            }
        });

        revalidatePath(`/profile/${userId}`);
        revalidatePath("/dashboard/portfolio");

        return { success: true, config };
    } catch (error: any) {
        console.error("Error updating portfolio config:", error);
        return { success: false, error: error.message };
    }
};

export const uploadPortfolioHeroImage = async (userId: string, formData: FormData) => {
    try {
        const userInventory = await prisma.userInventory.findFirst({
            where: {
                userId,
                shopItem: {
                    type: "SAAS_TEMPLATE"
                }
            }
        });

        if (!userInventory) {
            throw new Error("You must purchase the Portfolio Template to use this feature.");
        }

        const file = formData.get("image") as File;
        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        const config = await prisma.portfolioConfig.upsert({
            where: { userId },
            create: {
                userId,
                heroImage: asset.url
            },
            update: {
                heroImage: asset.url
            }
        });

        revalidatePath(`/profile/${userId}`);
        revalidatePath("/dashboard/portfolio");

        return { success: true, imageUrl: asset.url };
    } catch (error: any) {
        console.error("Error uploading hero image:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const uploadPortfolioLogo = async (userId: string, formData: FormData) => {
    try {
        const userInventory = await prisma.userInventory.findFirst({
            where: {
                userId,
                shopItem: {
                    type: "SAAS_TEMPLATE"
                }
            }
        });

        if (!userInventory) {
            throw new Error("You must purchase the Portfolio Template to use this feature.");
        }

        const file = formData.get("image") as File;
        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        const config = await prisma.portfolioConfig.upsert({
            where: { userId },
            create: {
                userId,
                logo: asset.url
            },
            update: {
                logo: asset.url
            }
        });

        revalidatePath(`/profile/${userId}`);
        revalidatePath("/dashboard/portfolio");

        return { success: true, imageUrl: asset.url };
    } catch (error: any) {
        console.error("Error uploading logo:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const uploadPortfolioGalleryImage = async (userId: string, formData: FormData) => {
    try {
        const userInventory = await prisma.userInventory.findFirst({
            where: {
                userId,
                shopItem: {
                    type: "SAAS_TEMPLATE"
                }
            }
        });

        if (!userInventory) {
            throw new Error("You must purchase the Portfolio Template to use this feature.");
        }

        const file = formData.get("image") as File;
        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        const newImage = {
            url: asset.url,
            title: formData.get("title") as string || "",
            description: formData.get("description") as string || "",
            width: asset.metadata?.dimensions?.width,
            height: asset.metadata?.dimensions?.height,
            id: asset._id
        };

        const currentConfig = await prisma.portfolioConfig.findUnique({ where: { userId } });
        const currentGallery = (currentConfig?.gallery as any[]) || [];

        const config = await prisma.portfolioConfig.upsert({
            where: { userId },
            create: {
                userId,
                gallery: [newImage]
            },
            update: {
                gallery: [...currentGallery, newImage]
            }
        });

        revalidatePath(`/profile/${userId}`);
        revalidatePath("/dashboard/portfolio");

        return { success: true, image: newImage };
    } catch (error: any) {
        console.error("Error uploading gallery image:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const deletePortfolioGalleryImage = async (userId: string, imageUrl: string) => {
    try {
        const currentConfig = await prisma.portfolioConfig.findUnique({ where: { userId } });
        if (!currentConfig) return { success: false, error: "Config not found" };

        const currentGallery = (currentConfig.gallery as any[]) || [];
        const updatedGallery = currentGallery.filter((img: any) => img.url !== imageUrl);

        await prisma.portfolioConfig.update({
            where: { userId },
            data: {
                gallery: updatedGallery
            }
        });

        revalidatePath(`/profile/${userId}`);
        revalidatePath("/dashboard/portfolio");

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting gallery image:", error);
        return { success: false, error: "Failed to delete image" };
    }
};
