"use server";

import prisma from "@/lib/prisma";
import { uploadLocalFile } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import { trackFirstBannerSetup } from "./gamification.actions";
import { serializeForClient } from "@/lib/utils";
import { auth } from "@/auth";

export const getUserByUsername = async (username: string, currentUserId?: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                _count: {
                    select: {
                        posts: { where: { isArchived: false } },
                        comments: true,
                        followedBy: true,
                        following: true
                    }
                },
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
                inventory: { include: { shopItem: true } },
                portfolioConfig: true,
                followedBy: {
                    where: { id: currentUserId || "" },
                    select: { id: true }
                }
            } as any
        });

        const u = user as any;
        if (!u) return null;

        // Calculate total likes received
        const postLikes = (u.posts || []).reduce((acc: number, post: any) => acc + (post._count?.likedBy || 0), 0);
        const projectLikes = (u.projects || []).reduce((acc: number, proj: any) => acc + (proj._count?.likedBy || 0), 0);
        const totalLikes = postLikes + projectLikes;

        const bookmarks = [
            ...(u.bookmarkedPosts || []).map((p: any) => ({ _ref: p.id, type: 'post' })),
            ...(u.bookmarkedProjects || []).map((p: any) => ({ _ref: p.id, type: 'project' }))
        ];

        // Transform to match old shape if needed by UI, or return cleaner object
        return serializeForClient({
            ...u,
            fullName: u.name,
            _id: u.id,
            profileImage: u.image ? { asset: { url: u.image } } : null,
            bannerImage: u.bannerImage ? { asset: { url: u.bannerImage } } : null,
            imageURL: u.imageURL || u.image,
            bookmarks: bookmarks,
            points: u.points,
            profileColor: u.profileColor,
            frameColor: (await getRawFrameColor(u.id)) || u.frameColor,
            equippedFrame: u.equippedFrame,
            equippedBackground: u.equippedBackground,
            equippedBanner: u.equippedBanner,
            bannerVideo: u.bannerVideo,
            lastActiveAt: u.lastActiveAt,
            isFollowing: (u.followedBy || []).length > 0,
            stats: {
                posts: u._count?.posts || 0,
                comments: u._count?.comments || 0,
                likes: totalLikes,
                followers: u._count?.followedBy || 0,
                following: u._count?.following || 0
            }
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

// Internal helper for raw frame color fetch
async function getRawFrameColor(userId: string) {
    try {
        const rawUser = await prisma.$queryRawUnsafe(`SELECT frameColor FROM User WHERE id = ?`, userId) as any[];
        return rawUser[0]?.frameColor || null;
    } catch (e) {
        return null;
    }
}

export const updateUserProfile = async (userId: string, data: any) => {
    try {
        // Clean JSON data to ensure no undefined values
        const cleanData = serializeForClient({
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
            equippedBackground: data.equippedBackground,
        });

        // Enforce mutual exclusivity: If color is set, clear background image
        if (cleanData.profileColor) {
            cleanData.equippedBackground = null;
        }

        await prisma.user.update({
            where: { id: userId },
            data: cleanData
        });

        // Optional: Revalidate paths that might display this info
        if (data.username) {
            revalidatePath(`/profile/${data.username}`);
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

        const imageUrl = await uploadLocalFile(file, "profiles");

        // 2. Update URL in Prisma
        await prisma.user.update({
            where: { id: userId },
            data: {
                image: imageUrl
            }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });

        if (user) {
            revalidatePath(`/profile/${user.username}`);
        }

        return { success: true, imageUrl: imageUrl };
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

        const imageUrl = await uploadLocalFile(file, "banners");

        // Update bannerImage AND reset equippedBanner if it was set to custom-video
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { equippedBanner: true, username: true }
        });

        await prisma.user.update({
            where: { id: userId },
            data: {
                bannerImage: imageUrl,
                // If user was using custom-video banner, reset it so image shows
                ...(currentUser?.equippedBanner === 'custom-video' ? { equippedBanner: null } : {})
            }
        });

        if (currentUser?.username) {
            revalidatePath(`/profile/${currentUser.username}`);
        }

        // Track Achievement
        trackFirstBannerSetup(userId).catch(err => console.error("First Banner Track Error:", err));

        return { success: true, imageUrl: imageUrl };
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

export const uploadBannerVideo = async (userId: string, formData: FormData) => {
    try {
        const file = formData.get("video") as File;
        if (!file) return { success: false, error: "No video uploaded" };

        if (file.size > 10 * 1024 * 1024) {
            return { success: false, error: "Video exceeds 10MB limit" };
        }

        const videoUrl = await uploadLocalFile(file, "banners_video");

        // 2. Update Prisma
        await prisma.user.update({
            where: { id: userId },
            data: { bannerVideo: videoUrl }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user?.username) {
            revalidatePath(`/profile/${user.username}`);
            revalidatePath(`/user/${user.username}`);
        }

        return { success: true, videoUrl: videoUrl };
    } catch (error) {
        console.error("Error uploading banner video:", error);
        return { success: false, error: "Failed to upload video" };
    }
};

export const uploadCustomBackground = async (userId: string, formData: FormData) => {
    try {
        const file = formData.get("image") as File;
        if (!file) return { success: false, error: "No file uploaded" };

        const imageUrl = await uploadLocalFile(file, "backgrounds");

        // 2. Fetch current preferences to preserve other data
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        const currentPreferences = (currentUser?.preferences as Record<string, any>) || {};

        // 3. Update Prisma (equippedBackground stores the URL AND we save it to preferences for persistence)
        await prisma.user.update({
            where: { id: userId },
            data: {
                equippedBackground: imageUrl,
                profileColor: null, // Enforce mutual exclusivity
                preferences: {
                    ...currentPreferences,
                    customBackgroundUrl: imageUrl // Persist the URL so we can re-equip later
                }
            }
        });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        if (user) {
            revalidatePath(`/user/${user.username}`);
        }

        return { success: true, imageUrl: imageUrl };
    } catch (error) {
        console.error("Error uploading custom background:", error);
        return { success: false, error: "Failed to upload image" };
    }
};

export const removeCustomBackground = async (userId: string) => {
    try {
        // 1. Fetch current preferences to preserve other data
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true, username: true }
        });

        const currentPreferences = (currentUser?.preferences as Record<string, any>) || {};

        // Remove customBackgroundUrl
        const { customBackgroundUrl, ...remainingPreferences } = currentPreferences;

        // 2. Update Prisma
        await prisma.user.update({
            where: { id: userId },
            data: {
                equippedBackground: null,
                preferences: remainingPreferences
            }
        });

        if (currentUser?.username) {
            revalidatePath(`/user/${currentUser.username}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error removing custom background:", error);
        return { success: false, error: "Failed to remove background" };
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
                inventory: { include: { shopItem: true } },
                portfolioConfig: true
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

        return serializeForClient({
            ...user,
            fullName: user.name,
            _id: user.id,
            profileImage: user.image ? { asset: { url: user.image } } : null,
            bannerImage: user.bannerImage ? { asset: { url: user.bannerImage } } : null,
            imageURL: user.imageURL || user.image,
            bookmarks: bookmarks,
            points: user.points,
            profileColor: (user as any).profileColor,
            frameColor: (await getRawFrameColor(user.id)) || (user as any).frameColor,
            equippedFrame: (user as any).equippedFrame,
            equippedBackground: (user as any).equippedBackground,
            equippedBanner: (user as any).equippedBanner,
            bannerVideo: (user as any).bannerVideo,
            lastActiveAt: (user as any).lastActiveAt,
            stats: {
                posts: user._count.posts,
                comments: user._count.comments,
                likes: totalLikes
            }
        });
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

export async function updateUserAdmin(userId: string, data: {
    name: string;
    username: string;
    email: string;
    role: string;
    points: number;
    bio?: string;
    headline?: string;
    location?: string;
    website?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!currentUser) {
            return { success: false, error: "User not found" };
        }

        // Get target user to check permissions
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!targetUser) {
            return { success: false, error: "Target user not found" };
        }

        // Permission checks
        const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
        const isAdmin = currentUser.role === "ADMIN";

        // Only SUPER_ADMIN can edit other SUPER_ADMIN users
        if (targetUser.role === "SUPER_ADMIN" && !isSuperAdmin) {
            return { success: false, error: "Only Super Admin can edit Super Admin users" };
        }

        // Only SUPER_ADMIN and ADMIN can use this function
        if (!isSuperAdmin && !isAdmin) {
            return { success: false, error: "Insufficient permissions" };
        }

        // Check if username or email is already taken by another user
        if (data.username) {
            const existingUsername = await prisma.user.findFirst({
                where: {
                    username: data.username,
                    NOT: { id: userId }
                }
            });
            if (existingUsername) {
                return { success: false, error: "Username already taken" };
            }
        }

        if (data.email) {
            const existingEmail = await prisma.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id: userId }
                }
            });
            if (existingEmail) {
                return { success: false, error: "Email already taken" };
            }
        }

        // Update user
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                username: data.username,
                email: data.email,
                role: data.role as any,
                points: data.points,
                bio: data.bio || null,
                headline: data.headline || null,
                location: data.location || null,
                website: data.website || null
            }
        });

        revalidatePath("/admin/users");
        revalidatePath(`/profile/${data.username}`);

        return serializeForClient({ success: true });
    } catch (error: any) {
        console.error("Error updating user:", error);
        return { success: false, error: error.message || "Failed to update user" };
    }
}


export const getAllUsers = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                imageURL: true,
                image: true
            },
            orderBy: { name: 'asc' }
        });
        return users;
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
};


// Username update with 30-day cooldown
export const updateUsername = async (userId: string, newUsername: string) => {
    try {
        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(newUsername)) {
            return {
                success: false,
                error: "Username must be 3-20 characters, alphanumeric and underscore only"
            };
        }

        // Check reserved usernames
        const reservedUsernames = ['admin', 'system', 'root', 'user', 'moderator', 'support'];
        if (reservedUsernames.includes(newUsername.toLowerCase())) {
            return {
                success: false,
                error: "This username is reserved and cannot be used"
            };
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true, lastUsernameChange: true }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Check if username is same
        if (user.username === newUsername) {
            return { success: false, error: "Please enter a different username" };
        }

        // Check 30-day cooldown
        if (user.lastUsernameChange) {
            const daysSinceLastChange = Math.floor(
                (Date.now() - new Date(user.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastChange < 30) {
                const daysRemaining = 30 - daysSinceLastChange;
                const nextChangeDate = new Date(user.lastUsernameChange);
                nextChangeDate.setDate(nextChangeDate.getDate() + 30);

                return {
                    success: false,
                    error: `You can only change your username once every 30 days. Next change available in ${daysRemaining} days (${nextChangeDate.toLocaleDateString()})`,
                    cooldownActive: true,
                    daysRemaining,
                    nextChangeDate: nextChangeDate.toISOString()
                };
            }
        }

        // Check if username already exists (case-insensitive)
        const existingUser = await prisma.user.findFirst({
            where: {
                username: newUsername,
                NOT: { id: userId }
            }
        });

        if (existingUser) {
            return { success: false, error: "This username is already taken" };
        }

        // Update username and timestamp
        await prisma.user.update({
            where: { id: userId },
            data: {
                username: newUsername,
                lastUsernameChange: new Date()
            }
        });

        // Revalidate paths
        revalidatePath('/dashboard');
        revalidatePath(`/profile/${newUsername}`);
        if (user.username) {
            revalidatePath(`/user/${user.username}`);
        }

        return {
            success: true,
            message: "Username updated successfully!"
        };
    } catch (error: any) {
        console.error("Error updating username:", error);
        return {
            success: false,
            error: `Failed to update username: ${error.message}`
        };
    }
};

export const followUser = async (followerId: string, targetId: string) => {
    try {
        if (followerId === targetId) throw new Error("Cannot follow yourself");

        await prisma.user.update({
            where: { id: followerId },
            data: {
                following: {
                    connect: { id: targetId }
                }
            } as any
        });

        const follower = await prisma.user.findUnique({
            where: { id: followerId },
            select: { username: true }
        });

        const target = await prisma.user.findUnique({
            where: { id: targetId },
            select: { username: true }
        });

        // Add activity
        await prisma.activity.create({
            data: {
                userId: followerId,
                type: "follow",
                details: {
                    targetId,
                    targetUsername: target?.username
                }
            }
        });

        // Create notification
        const { createNotification } = await import("./notification.actions");
        await createNotification({
            recipientId: targetId,
            senderId: followerId,
            type: 'follow'
        });

        if (target?.username) revalidatePath(`/profile/${target.username}`);
        if (follower?.username) revalidatePath(`/profile/${follower.username}`);

        return { success: true };
    } catch (error) {
        console.error("Error following user:", error);
        return { success: false };
    }
};

export const unfollowUser = async (followerId: string, targetId: string) => {
    try {
        await prisma.user.update({
            where: { id: followerId },
            data: {
                following: {
                    disconnect: { id: targetId }
                }
            } as any
        });

        const follower = await prisma.user.findUnique({
            where: { id: followerId },
            select: { username: true }
        });

        const target = await prisma.user.findUnique({
            where: { id: targetId },
            select: { username: true }
        });

        if (target?.username) revalidatePath(`/profile/${target.username}`);
        if (follower?.username) revalidatePath(`/profile/${follower.username}`);

        return { success: true };
    } catch (error) {
        console.error("Error unfollowing user:", error);
        return { success: false };
    }
};

export const updateUserPresence = async (userId: string) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() }
        });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};
