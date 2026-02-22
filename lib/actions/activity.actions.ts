"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeForClient } from "@/lib/utils";

export type Activity = {
    id: string;
    type: "new_user" | "new_project" | "project_update" | "user_post" | "achievement" | "badge_awarded";
    timestamp: string;
    actor: {
        name: string;
        username: string;
        image: any;
        equippedEffect?: string;
        equippedFrame?: string;
        equippedBackground?: string;
        profileColor?: string;
        frameColor?: string;
    };
    details: {
        title?: string;
        slug?: string;
        description?: string;
        image?: any;
        video?: string | null;
        badgeName?: string;
        badgeIcon?: string;
        achievementTitle?: string;
    };
    likesCount: number;
    isLiked: boolean;
    commentsCount?: number;
    repostsCount?: number;
    isReposted?: boolean;
    originalPost?: any;
};

export const createActivity = async (userId: string, type: string, details: any) => {
    try {
        await prisma.activity.create({
            data: {
                userId,
                type,
                details: details as any
            }
        });
        revalidatePath("/");
        revalidatePath("/dashboard");
        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error creating activity:", error);
        return serializeForClient({ success: false });
    }
}

export const getRecentActivities = async (currentUserId?: string, limit = 10, before?: string): Promise<Activity[]> => {
    const activities: Activity[] = [];
    const dateLimit = before ? { lt: new Date(before) } : undefined;
    try {
        // 1. Fetch New Users
        let users: any[] = [];
        try {
            users = await prisma.user.findMany({
                take: limit,
                where: before ? { createdAt: dateLimit } : {},
                orderBy: { createdAt: 'desc' },
            });
        } catch (e) {
            console.error("Error fetching users for activities:", e);
        }

        // 2. Fetch New Projects
        let projects: any[] = [];
        try {
            projects = await prisma.project.findMany({
                take: limit,
                where: {
                    status: "PUBLISHED",
                    ...(before ? { createdAt: dateLimit } : {})
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { likedBy: true, comments: true } },
                    likedBy: currentUserId ? { where: { id: currentUserId } } : false
                }
            });
        } catch (e) {
            console.error("Error fetching projects for activities:", e);
        }

        // 3. Fetch New Posts
        let posts: any[] = [];
        try {
            posts = await prisma.post.findMany({
                take: limit,
                where: {
                    isArchived: false,
                    ...(before ? { createdAt: dateLimit } : {})
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    author: true,
                    originalPost: { include: { author: true } } as any,
                    _count: { select: { likedBy: true, comments: true, reposts: true } as any },
                    likedBy: currentUserId ? { where: { id: currentUserId } } : false,
                    reposts: currentUserId ? { where: { authorId: currentUserId } } : false
                }
            });
        } catch (e) {
            console.error("Error fetching posts for activities:", e);
        }

        // 4. Fetch Custom Activities (Achievements etc)
        let customActivities: any[] = [];
        try {
            // Check if activity model exists in prisma before calling
            if ((prisma as any).activity) {
                customActivities = await (prisma as any).activity.findMany({
                    take: limit,
                    where: before ? { createdAt: dateLimit } : {},
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: true,
                        _count: { select: { likedBy: true } },
                        likedBy: currentUserId ? { where: { id: currentUserId } } : false
                    }
                });
            } else {
                console.warn("Prisma 'activity' model not found in client. Schema sync might be needed.");
            }
        } catch (e) {
            console.error("Error fetching custom activities:", e);
        }

        // Map Achievements
        customActivities.forEach((act) => {
            activities.push({
                id: `act-${act.id}`,
                type: act.type as any,
                timestamp: act.createdAt.toISOString(),
                actor: {
                    name: act.user.name || "User",
                    username: act.user.username || "user",
                    image: act.user.imageURL || act.user.image,
                    equippedFrame: (act.user as any).equippedFrame || undefined,
                    frameColor: (act.user as any).frameColor || undefined
                },
                details: act.details as any,
                likesCount: act._count?.likedBy || 0,
                isLiked: act.likedBy && act.likedBy.length > 0
            });
        });

        // Map Users
        users.forEach((user) => {
            activities.push({
                id: `user-${user.id}`,
                type: "new_user",
                timestamp: user.createdAt.toISOString(),
                actor: {
                    name: user.name || "User",
                    username: user.username || "user",
                    image: user.imageURL || user.image,
                    equippedEffect: (user as any).equippedEffect || undefined,
                    equippedFrame: (user as any).equippedFrame || undefined,
                    equippedBackground: (user as any).equippedBackground || undefined,
                    profileColor: (user as any).profileColor || undefined,
                    frameColor: (user as any).frameColor || undefined
                },
                details: {
                    description: "joined the community"
                },
                likesCount: 0,
                isLiked: false
            });
        });

        // Map Projects
        projects.forEach((project) => {
            activities.push({
                id: `project-${project.id}`,
                type: "new_project",
                timestamp: project.createdAt.toISOString(),
                actor: {
                    name: "Herdian",
                    username: "admin",
                    image: null
                },
                details: {
                    title: project.title,
                    slug: project.slug,
                    image: project.image,
                    description: "added a new project"
                },
                likesCount: project._count.likedBy,
                commentsCount: project._count.comments,
                isLiked: project.likedBy && project.likedBy.length > 0
            });
        });

        // Map Posts
        posts.forEach((postItem) => {
            const post = postItem as any; // Cast to any to handle new fields
            const isRepost = !!post.originalPostId;
            const original = post.originalPost;

            activities.push({
                id: `post-${post.id}`,
                type: "user_post",
                timestamp: post.createdAt.toISOString(),
                actor: {
                    name: post.author.name || "User",
                    username: post.author.username || "user",
                    image: post.author.imageURL || post.author.image,
                    equippedEffect: (post.author as any).equippedEffect || undefined,
                    equippedFrame: (post.author as any).equippedFrame || undefined,
                    equippedBackground: (post.author as any).equippedBackground || undefined,
                    profileColor: (post.author as any).profileColor || undefined,
                    frameColor: (post.author as any).frameColor || undefined
                },
                details: {
                    title: isRepost ? (original?.text || "") : post.text,
                    image: isRepost ? original?.image : post.image,
                    video: isRepost ? original?.video : post.video,
                    description: isRepost ? (original?.text || "") : post.text
                },
                likesCount: post._count.likedBy,
                isLiked: post.likedBy && post.likedBy.length > 0,
                commentsCount: post._count.comments,
                repostsCount: post._count.reposts || 0,
                isReposted: post.reposts && post.reposts.length > 0,
                originalPost: isRepost && original ? {
                    id: original.id,
                    author: {
                        name: original.author.name || "User",
                        username: original.author.username || "user",
                        image: original.author.imageURL || original.author.image,
                        equippedEffect: (original.author as any).equippedEffect || undefined,
                        equippedFrame: (original.author as any).equippedFrame || undefined,
                        equippedBackground: (original.author as any).equippedBackground || undefined,
                        profileColor: (original.author as any).profileColor || undefined,
                        frameColor: (original.author as any).frameColor || undefined
                    },
                    text: original.text,
                    image: original.image,
                    video: original.video,
                    createdAt: original.createdAt.toISOString()
                } : undefined
            });
        });

        return serializeForClient(activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit));

    } catch (error) {
        console.error("Error fetching activities:", error);
        return serializeForClient([]);
    }
};

export const getUserActivities = async (username: string, currentUserId?: string, limit = 10, before?: string): Promise<Activity[]> => {
    const activities: Activity[] = [];
    const dateLimit = before ? { lt: new Date(before) } : undefined;
    try {
        const targetUser = await prisma.user.findUnique({
            where: { username }
        });

        if (!targetUser) return serializeForClient([]);

        // 1. User Posts
        let posts: any[] = [];
        try {
            posts = await prisma.post.findMany({
                where: {
                    authorId: targetUser.id,
                    isArchived: false,
                    ...(before ? { createdAt: dateLimit } : {})
                },
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: true,
                    originalPost: { include: { author: true } } as any,
                    _count: { select: { likedBy: true, comments: true, reposts: true } as any },
                    likedBy: currentUserId ? { where: { id: currentUserId } } : false,
                    reposts: currentUserId ? { where: { authorId: currentUserId } } : false
                }
            });
        } catch (e) {
            console.error("Error fetching user posts:", e);
        }

        // 2. User Projects
        let projects: any[] = [];
        try {
            projects = await prisma.project.findMany({
                where: {
                    authorId: targetUser.id,
                    status: "PUBLISHED",
                    ...(before ? { uploadDate: dateLimit } : {})
                },
                take: limit,
                orderBy: { uploadDate: 'desc' },
                include: {
                    _count: { select: { likedBy: true, comments: true } },
                    likedBy: currentUserId ? { where: { id: currentUserId } } : false
                }
            });
        } catch (e) {
            console.error("Error fetching user projects:", e);
        }

        // 3. User Custom Activities
        let customActivities: any[] = [];
        try {
            if ((prisma as any).activity) {
                customActivities = await (prisma as any).activity.findMany({
                    where: {
                        userId: targetUser.id,
                        ...(before ? { createdAt: dateLimit } : {})
                    },
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: { select: { likedBy: true } },
                        likedBy: currentUserId ? { where: { id: currentUserId } } : false
                    }
                });
            }
        } catch (e) {
            console.error("Error fetching user custom activities:", e);
        }

        // Map Achievements
        customActivities.forEach((act) => {
            activities.push({
                id: `act-${act.id}`,
                type: act.type as any,
                timestamp: act.createdAt.toISOString(),
                actor: {
                    name: targetUser.name || "User",
                    username: targetUser.username || "user",
                    image: targetUser.imageURL || targetUser.image,
                    equippedFrame: (targetUser as any).equippedFrame || undefined,
                    frameColor: (targetUser as any).frameColor || undefined
                },
                details: act.details as any,
                likesCount: act._count?.likedBy || 0,
                isLiked: act.likedBy && act.likedBy.length > 0
            });
        });

        if (targetUser) {
            activities.push({
                id: `user-${targetUser.id}`,
                type: "new_user",
                timestamp: targetUser.createdAt.toISOString(),
                actor: {
                    name: targetUser.name || "User",
                    username: targetUser.username || "user",
                    image: targetUser.imageURL || targetUser.image,
                    equippedEffect: (targetUser as any).equippedEffect || undefined,
                    equippedFrame: (targetUser as any).equippedFrame || undefined,
                    equippedBackground: (targetUser as any).equippedBackground || undefined,
                    profileColor: (targetUser as any).profileColor || undefined,
                    frameColor: (targetUser as any).frameColor || undefined
                },
                details: { description: "joined the community" },
                likesCount: 0,
                isLiked: false
            });
        }

        projects.forEach((project) => {
            activities.push({
                id: `project-${project.id}`,
                type: "new_project",
                timestamp: project.uploadDate.toISOString(),
                actor: {
                    name: targetUser.name || "User",
                    username: targetUser.username || "user",
                    image: targetUser.imageURL || targetUser.image,
                    equippedFrame: (targetUser as any).equippedFrame || undefined,
                    frameColor: (targetUser as any).frameColor || undefined
                },
                details: {
                    title: project.title,
                    slug: project.slug,
                    image: project.image,
                    description: "added a new project"
                },
                likesCount: project._count.likedBy,
                commentsCount: project._count.comments,
                isLiked: project.likedBy && project.likedBy.length > 0
            });
        });

        posts.forEach((postItem) => {
            const post = postItem as any;
            const isRepost = !!post.originalPostId;
            const original = post.originalPost;

            activities.push({
                id: `post-${post.id}`,
                type: "user_post",
                timestamp: post.createdAt.toISOString(),
                actor: {
                    name: post.author.name || "User",
                    username: post.author.username || "user",
                    image: post.author.imageURL || post.author.image,
                    equippedEffect: (post.author as any).equippedEffect || undefined,
                    equippedFrame: (post.author as any).equippedFrame || undefined,
                    equippedBackground: (post.author as any).equippedBackground || undefined,
                    profileColor: (post.author as any).profileColor || undefined,
                    frameColor: (post.author as any).frameColor || undefined
                },
                details: {
                    title: isRepost ? (original?.text || "") : post.text,
                    image: isRepost ? original?.image : post.image,
                    video: isRepost ? original?.video : post.video,
                    description: isRepost ? (original?.text || "") : post.text
                },
                likesCount: post._count.likedBy,
                commentsCount: post._count.comments,
                isLiked: post.likedBy && post.likedBy.length > 0,
                repostsCount: post._count.reposts || 0,
                isReposted: post.reposts && post.reposts.length > 0,
                originalPost: isRepost && original ? {
                    id: original.id,
                    author: {
                        name: original.author.name || "User",
                        username: original.author.username || "user",
                        image: original.author.imageURL || original.author.image,
                        equippedEffect: (original.author as any).equippedEffect || undefined,
                        equippedFrame: (original.author as any).equippedFrame || undefined,
                        equippedBackground: (original.author as any).equippedBackground || undefined,
                        profileColor: (original.author as any).profileColor || undefined,
                        frameColor: (original.author as any).frameColor || undefined
                    },
                    text: original.text,
                    image: original.image,
                    video: original.video,
                    createdAt: original.createdAt.toISOString()
                } : undefined
            });
        });

        return serializeForClient(activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit));
    } catch (error) {
        console.error("Error fetching user activities:", error);
        return serializeForClient([]);
    }
};
