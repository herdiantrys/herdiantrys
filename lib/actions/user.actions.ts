"use server";

import prisma from "@/lib/prisma";
import { writeClient } from "@/sanity/lib/write-client"; // Keep for image upload
import { revalidatePath } from "next/cache";

export const getUserByUsername = async (username: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                _count: {
                    select: {
                        posts: { where: { isArchived: false } }, // Only count active posts
                        comments: true
                    }
                },
                // Fetch posts/projects to calc received likes
                posts: {
                    where: { isArchived: false },
                    select: {
                        _count: { select: { likedBy: true } }
                    }
                },
                projects: {
                    select: {
                        _count: { select: { likedBy: true } }
                    }
                },
                bookmarkedPosts: {
                    where: { isArchived: false },
                    select: { id: true }
                },
                bookmarkedProjects: { select: { id: true } }
            }
        });

        if (!user) return null;

        // Calculate total likes received
        const postLikes = user.posts.reduce((acc: number, post: any) => acc + post._count.likedBy, 0);
        const projectLikes = user.projects.reduce((acc: number, proj: any) => acc + proj._count.likedBy, 0);
        const totalLikes = postLikes + projectLikes;

        const bookmarks = [
            ...user.bookmarkedPosts.map((p: any) => ({ _ref: p.id, type: 'post' })),
            ...user.bookmarkedProjects.map((p: any) => ({ _ref: p.id, type: 'project' }))
        ];

        // Transform to match old shape if needed by UI, or return cleaner object
        return {
            ...user,
            fullName: user.name, // Map name to fullName for UI compatibility
            // Map Prisma fields to old Sanity fields if UI expects specific names
            _id: user.id,
            profileImage: user.image ? { asset: { url: user.image } } : null,
            bannerImage: user.bannerImage ? { asset: { url: user.bannerImage } } : null,
            imageURL: user.imageURL || user.image, // Fallback
            bookmarks: bookmarks,
            points: user.points,
            profileColor: (user as any).profileColor,
            equippedFrame: (user as any).equippedFrame,
            equippedBackground: (user as any).equippedBackground,
            stats: {
                posts: user._count.posts,
                comments: user._count.comments,
                likes: totalLikes
            }
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const updateUserProfile = async (userId: string, data: any) => {
    try {
        console.log("Updating user profile:", userId);
        // Clean JSON data to ensure no undefined values
        const cleanData = JSON.parse(JSON.stringify({
            name: data.fullName,
            headline: data.headline,
            bio: data.bio,
            location: data.location,
            website: data.website,
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || [],
            socialLinks: data.socialLinks || [],
            profileColor: data.profileColor,
        }));

        // Enforce mutual exclusivity: If color is set, clear background image
        if (cleanData.profileColor) {
            cleanData.equippedBackground = null;
        }

        console.log("Cleaned Update Data:", cleanData);

        await prisma.user.update({
            where: { id: userId },
            data: cleanData
        });

        // Optional: Revalidate paths that might display this info
        if (data.username) {
            revalidatePath(`/user/${data.username}`);
        }
        revalidatePath("/"); // Homepage

        return { success: true };
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return {
            success: false,
            error: `Update failed: ${error.message}. Payload keys: ${Object.keys(data).join(', ')}`
        };
    }
};

export const uploadProfileImage = async (userId: string, formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        // 1. Upload to Sanity (Asset Store)
        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        // 2. Update URL in Prisma
        await prisma.user.update({
            where: { id: userId },
            data: {
                image: asset.url
            }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });

        if (user) {
            revalidatePath(`/user/${user.username}`);
        }

        return { success: true, imageUrl: asset.url };
    } catch (error) {
        console.error("Error uploading profile image:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const removeProfileImage = async (userId: string) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { image: null }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user) {
            revalidatePath(`/user/${user.username}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error removing profile image:", error);
        return { success: false, error: "Failed to remove image" };
    }
};

export const uploadBannerImage = async (userId: string, formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        // 1. Upload to Sanity
        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        // 2. Update Prisma
        await prisma.user.update({
            where: { id: userId },
            data: { bannerImage: asset.url }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user) {
            revalidatePath(`/user/${user.username}`);
        }

        return { success: true, imageUrl: asset.url };
    } catch (error) {
        console.error("Error uploading banner image:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const removeBannerImage = async (userId: string) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { bannerImage: null }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user) {
            revalidatePath(`/user/${user.username}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error removing banner image:", error);
        return { success: false, error: "Failed to remove image" };
    }
};

export const uploadCustomBackground = async (userId: string, formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        // 1. Upload to Sanity
        const asset = await writeClient.assets.upload("image", file, {
            contentType: file.type,
            filename: file.name,
        });

        // 2. Update Prisma (equippedBackground stores the URL)
        await prisma.user.update({
            where: { id: userId },
            data: {
                equippedBackground: asset.url,
                profileColor: null // Enforce mutual exclusivity
            }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user) {
            revalidatePath(`/user/${user.username}`);
        }

        return { success: true, imageUrl: asset.url };
    } catch (error) {
        console.error("Error uploading custom background:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const getUserByEmail = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                _count: {
                    select: {
                        posts: { where: { isArchived: false } },
                        comments: true
                    }
                },
                // Fetch posts/projects to calc received likes
                posts: {
                    where: { isArchived: false },
                    select: {
                        _count: { select: { likedBy: true } }
                    }
                },
                projects: {
                    select: {
                        _count: { select: { likedBy: true } }
                    }
                },
                bookmarkedPosts: {
                    where: { isArchived: false },
                    select: { id: true }
                },
                bookmarkedProjects: { select: { id: true } },
                inventory: { include: { shopItem: true } }
            }
        });

        if (!user) return null;

        // Calculate total likes received
        const postLikes = user.posts.reduce((acc: number, post: any) => acc + post._count.likedBy, 0);
        const projectLikes = user.projects.reduce((acc: number, proj: any) => acc + proj._count.likedBy, 0);
        const totalLikes = postLikes + projectLikes;

        // Combine bookmarks into a single list of IDs or objects if UI expects that
        // Assuming UI checks for _ref in bookmarks
        const bookmarks = [
            ...user.bookmarkedPosts.map((p: any) => ({ _ref: p.id, type: 'post' })),
            ...user.bookmarkedProjects.map((p: any) => ({ _ref: p.id, type: 'project' }))
        ];

        return {
            ...user,
            fullName: user.name, // Map for UI compatibility
            _id: user.id,
            profileImage: user.image ? { asset: { url: user.image } } : null,
            bannerImage: user.bannerImage ? { asset: { url: user.bannerImage } } : null,
            imageURL: user.imageURL || user.image,
            bookmarks: bookmarks,
            points: user.points,
            profileColor: (user as any).profileColor,
            equippedFrame: (user as any).equippedFrame,
            equippedBackground: (user as any).equippedBackground,
            inventory: user.inventory,
            stats: {
                posts: user._count.posts,
                comments: user._count.comments,
                likes: totalLikes
            }
        };
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
};

export const deleteUser = async (userId: string) => {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
};

export const updateUserRole = async (userId: string, role: ("USER" | "ADMIN" | "SUPER_ADMIN")) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update role" };
    }
};



export async function updateUserStatus(userId: string, status: "ACTIVE" | "LIMITED" | "BANNED" | "ARCHIVED") {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user status:", error);
        return { success: false, error: error.message };
    }
}


export async function bulkUpdateUserStatus(ids: string[], status: "ACTIVE" | "LIMITED" | "BANNED" | "ARCHIVED") {
    try {
        await prisma.user.updateMany({
            where: { id: { in: ids } },
            data: { status }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating users status:", error);
        return { success: false, error: error.message };
    }
}

export async function bulkDeleteUsers(ids: string[]) {
    try {
        await prisma.user.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting users:", error);
        return { success: false, error: error.message };
    }
}


