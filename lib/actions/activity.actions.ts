"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type Activity = {
    id: string;
    type: "new_user" | "new_project" | "project_update" | "user_post";
    timestamp: string;
    actor: {
        name: string;
        username: string;
        image: any;
        equippedEffect?: string;
        equippedFrame?: string;
        equippedBackground?: string;
    };
    details: {
        title?: string;
        slug?: string;
        description?: string;
        image?: any;
        video?: string | null;
    };
    likesCount: number;
    isLiked: boolean;
    commentsCount?: number;
    repostsCount?: number;
    isReposted?: boolean;
    originalPost?: any;
};

export const getRecentActivities = async (currentUserId?: string): Promise<Activity[]> => {
    try {
        // 1. Fetch New Users
        const users = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        // 2. Fetch New Projects
        const projects = await prisma.project.findMany({
            take: 10,
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { likedBy: true, comments: true } },
                likedBy: currentUserId ? { where: { id: currentUserId } } : false
            }
        });

        // 3. Fetch New Posts
        const posts = await prisma.post.findMany({
            take: 10,
            where: { isArchived: false },
            orderBy: { createdAt: 'desc' },
            include: {
                author: true,
                originalPost: { include: { author: true } } as any,
                _count: { select: { likedBy: true, comments: true, reposts: true } as any },
                likedBy: currentUserId ? { where: { id: currentUserId } } : false,
                reposts: currentUserId ? { where: { authorId: currentUserId } } : false
            }
        });

        const activities: Activity[] = [];

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
                    equippedBackground: (user as any).equippedBackground || undefined
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
                    equippedBackground: (post.author as any).equippedBackground || undefined
                },
                details: {
                    title: isRepost ? (original?.text || "") : post.text,
                    image: isRepost ? original?.image : post.image,
                    video: isRepost ? original?.video : post.video,
                    description: isRepost ? (original?.text || "") : post.text
                },
                likesCount: post._count.likedBy,
                isLiked: post.likedBy.length > 0,
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
                        equippedBackground: (original.author as any).equippedBackground || undefined
                    },
                    text: original.text,
                    image: original.image,
                    video: original.video,
                    createdAt: original.createdAt.toISOString()
                } : undefined
            });
        });

        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
    }
};

export const getUserActivities = async (username: string, currentUserId?: string): Promise<Activity[]> => {
    try {
        const targetUser = await prisma.user.findUnique({
            where: { username }
        });

        if (!targetUser) return [];

        // 1. User Joined
        const userEvent = targetUser;

        // 2. User Posts
        const posts = await prisma.post.findMany({
            where: { authorId: targetUser.id, isArchived: false },
            orderBy: { createdAt: 'desc' },
            include: {
                author: true,
                originalPost: { include: { author: true } } as any,
                _count: { select: { likedBy: true, comments: true, reposts: true } as any },
                likedBy: currentUserId ? { where: { id: currentUserId } } : false,
                reposts: currentUserId ? { where: { authorId: currentUserId } } : false
            }
        });

        const activities: Activity[] = [];

        if (userEvent) {
            activities.push({
                id: `user-${userEvent.id}`,
                type: "new_user",
                timestamp: userEvent.createdAt.toISOString(),
                actor: {
                    name: userEvent.name || "User",
                    username: userEvent.username || "user",
                    image: userEvent.imageURL || userEvent.image,
                    equippedEffect: (userEvent as any).equippedEffect || undefined,
                    equippedFrame: (userEvent as any).equippedFrame || undefined,
                    equippedBackground: (userEvent as any).equippedBackground || undefined
                },
                details: { description: "joined the community" },
                likesCount: 0,
                isLiked: false
            });
        }

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
                    equippedBackground: (post.author as any).equippedBackground || undefined
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
                        equippedBackground: (original.author as any).equippedBackground || undefined
                    },
                    text: original.text,
                    image: original.image,
                    video: original.video,
                    createdAt: original.createdAt.toISOString()
                } : undefined
            });
        });

        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        console.error("Error fetching user activities:", error);
        return [];
    }
};
