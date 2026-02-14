"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { awardXP } from "./gamification.actions";

export const toggleBookmark = async (userId: string, targetId: string) => {
    try {
        // We don't know if targetId is Project or Post. Check Project first (common case)
        const project = await prisma.project.findUnique({
            where: { id: targetId },
            include: { bookmarkedBy: { where: { id: userId } } }
        });

        if (project) {
            const isBookmarked = project.bookmarkedBy.length > 0;
            if (isBookmarked) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { bookmarkedProjects: { disconnect: { id: targetId } } }
                });
            } else {
                await prisma.user.update({
                    where: { id: userId },
                    data: { bookmarkedProjects: { connect: { id: targetId } } }
                });
            }
            if (!isBookmarked) {
                await awardXP(userId, 10, `bookmark_project_${targetId}`);
            }
            revalidatePath("/dashboard");
            revalidatePath("/saved");
            return { success: true, isBookmarked: !isBookmarked };
        }

        const post = await prisma.post.findUnique({
            where: { id: targetId },
            include: { bookmarkedBy: { where: { id: userId } } }
        });

        if (post) {
            const isBookmarked = post.bookmarkedBy.length > 0;
            if (isBookmarked) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { bookmarkedPosts: { disconnect: { id: targetId } } }
                });
            } else {
                await prisma.user.update({
                    where: { id: userId },
                    data: { bookmarkedPosts: { connect: { id: targetId } } }
                });
                // No XP for bookmarking posts
            }
            revalidatePath("/dashboard");
            revalidatePath("/saved");
            return { success: true, isBookmarked: !isBookmarked };
        }

        return { success: false, error: "Item not found" };
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        return { success: false, error: "Failed to toggle bookmark" };
    }
};

export const getBookmarkedProjects = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                bookmarkedProjects: {
                    include: { category: true, _count: { select: { likedBy: true } } }
                },
                bookmarkedPosts: {
                    where: { isArchived: false },
                    include: { author: true }
                }
            }
        });

        if (!user) return [];

        // Map and unify
        const projects = user.bookmarkedProjects.map(p => ({
            _id: p.id,
            _type: 'project',
            _createdAt: p.createdAt.toISOString(),
            title: p.title,
            slug: p.slug, // String in Prisma
            projectImage: p.image,
            category: { title: p.category?.title || "Uncategorized" },
            // Add other fields if necessary
        }));

        const posts = user.bookmarkedPosts.map(p => ({
            _id: p.id,
            _type: 'post',
            _createdAt: p.createdAt.toISOString(),
            text: p.text,
            postImage: p.image,
            postAuthor: {
                fullName: p.author.name,
                username: p.author.username,
                profileImage: p.author.image,
                imageURL: p.author.imageURL
            }
        }));

        // Sort by createdAt desc
        return [...projects, ...posts].sort((a, b) =>
            new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
        );

    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }
};

export const checkIsBookmarked = async (userId: string, targetId: string) => {
    try {
        // Check Project
        const project = await prisma.project.findUnique({
            where: { id: targetId },
            include: { bookmarkedBy: { where: { id: userId } } }
        });
        if (project) return project.bookmarkedBy.length > 0;

        // Check Post
        const post = await prisma.post.findUnique({
            where: { id: targetId },
            include: { bookmarkedBy: { where: { id: userId } } }
        });
        if (post) return post.bookmarkedBy.length > 0;

        return false;
    } catch (error) {
        return false;
    }
}
