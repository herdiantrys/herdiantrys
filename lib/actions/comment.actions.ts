"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";
import { auth } from "@/auth";
import { trackComment, trackNightOwl } from "./gamification.actions";
import { serializeForClient } from "@/lib/utils";

export type Comment = {
    _id: string;
    text: string;
    createdAt: string;
    user: {
        _id: string;
        fullName: string;
        username: string;
        imageURL: string;
        profileImage?: any;
        equippedEffect?: string;
        equippedFrame?: string;
        equippedBackground?: string;
        profileColor?: string;
        frameColor?: string;
    };
};

export const getComments = async (targetId: string, targetType: "project" | "post") => {
    try {
        const whereClause = targetType === "project"
            ? { projectId: targetId }
            : { postId: targetId };

        const comments = await prisma.comment.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        imageURL: true,
                        image: true,
                        equippedEffect: true,
                        equippedFrame: true,
                        equippedBackground: true,
                        profileColor: true,
                        frameColor: true
                    }
                }
            }
        });

        return serializeForClient(comments.map(c => ({
            _id: c.id,
            text: c.text,
            createdAt: c.createdAt.toISOString(),
            user: {
                _id: (c as any).user.id,
                fullName: (c as any).user.name || "User",
                username: (c as any).user.username || "user",
                imageURL: (c as any).user.imageURL || (c as any).user.image || "",
                profileImage: (c as any).user.image ? { asset: { url: (c as any).user.image } } : null,
                equippedEffect: (c as any).user.equippedEffect || undefined,
                equippedFrame: (c as any).user.equippedFrame || undefined,
                equippedBackground: (c as any).user.equippedBackground || undefined,
                profileColor: (c as any).user.profileColor || undefined,
                frameColor: (c as any).user.frameColor || undefined
            }
        })));
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
};

export const createComment = async (targetId: string, targetType: "project" | "post", text: string) => {

    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.error("[createComment] No user session found");
            return { success: false, error: "Unauthorized" };
        }
        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { status: true }
        });

        if (user?.status === "LIMITED") {
            return { success: false, error: "Your account has limited posting privileges." };
        }


        // VALIDATE: Check if target exists before creating comment
        if (targetType === "project") {
            const projectExists = await prisma.project.findUnique({
                where: { id: targetId },
                select: { id: true }
            });
            if (!projectExists) {
                console.error(`[createComment] Project ${targetId} not found`);
                return { success: false, error: "Project not found" };
            }

        } else {
            const postExists = await prisma.post.findUnique({
                where: { id: targetId },
                select: { id: true }
            });
            if (!postExists) {
                console.error(`[createComment] Post ${targetId} not found`);
                return { success: false, error: "Post not found" };
            }

        }

        const data: any = {
            text,
            userId
        };

        if (targetType === "project") {
            data.projectId = targetId;
        } else {
            data.postId = targetId;
        }


        const newComment = await prisma.comment.create({
            data: data,
            include: {
                user: {
                    select: {
                        id: true, name: true, username: true,
                        imageURL: true, image: true, equippedEffect: true,
                        equippedFrame: true, equippedBackground: true, profileColor: true, frameColor: true
                    }
                },
                post: { select: { authorId: true } },
                project: { select: { authorId: true } }
            }
        });


        // Trigger Notification
        let recipientId = "";
        if (targetType === 'post' && (newComment as any).post) {
            recipientId = (newComment as any).post.authorId;
        } else if (targetType === 'project' && (newComment as any).project) {
            recipientId = (newComment as any).project.authorId;
        }



        if (recipientId && recipientId !== userId) {

            await createNotification({
                recipientId,
                senderId: userId,
                type: targetType === 'project' ? 'comment_project' : 'comment_post',
                relatedPostId: targetType === 'post' ? targetId : undefined,
                relatedProjectId: targetType === 'project' ? targetId : undefined,
                relatedCommentId: newComment.id
            });

        }

        // Gamification Hooks
        try {

            // 1. Track Comment (Social Butterfly)
            await trackComment(userId, targetType === 'project' ? targetId : undefined);

            // 2. Track Night Owl (if active at night)
            await trackNightOwl(userId);

        } catch (gameError) {
            console.error("[createComment] Gamification error (non-blocking):", gameError);
        }

        // Return structured comment object
        const createdComment = newComment as any; // Cast to any to bypass missing type inference

        const commentObj = {
            _id: createdComment.id,
            text: createdComment.text,
            createdAt: createdComment.createdAt.toISOString(),
            user: {
                _id: createdComment.user.id,
                fullName: createdComment.user.name || "User",
                username: createdComment.user.username || "user",
                imageURL: createdComment.user.imageURL || createdComment.user.image || "",
                profileImage: createdComment.user.image ? { asset: { url: createdComment.user.image } } : null,
                equippedEffect: createdComment.user.equippedEffect || undefined,
                equippedFrame: createdComment.user.equippedFrame || undefined,
                equippedBackground: createdComment.user.equippedBackground || undefined,
                profileColor: createdComment.user.profileColor || undefined,
                frameColor: createdComment.user.frameColor || undefined
            }
        };

        return serializeForClient({ success: true, comment: commentObj });
    } catch (error: any) {
        console.error("Error creating comment:", error);
        // Log the full error object for better debugging

        return serializeForClient({ success: false, error: error.message || "Failed to create comment" });
    }
};

// ADMIN ACTIONS

export const getAllComments = async ({
    page = 1,
    limit = 10,
    search = "",
    targetType = "ALL"
}: {
    page?: number;
    limit?: number;
    search?: string;
    targetType?: "ALL" | "POST" | "PROJECT";
} = {}) => {
    try {
        const session = await auth();
        // In a real app, check for ADMIN role here
        if (!session?.user?.id) {
            return { comments: [], total: 0, pages: 0 };
        }

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { text: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { username: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (targetType === "POST") {
            where.postId = { not: null };
        } else if (targetType === "PROJECT") {
            where.projectId = { not: null };
        }

        // Get total count for pagination
        const total = await prisma.comment.count({ where });

        const comments = await prisma.comment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        imageURL: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                        text: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        const formattedComments = comments.map(c => {
            const comment = c as any;
            return {
                id: comment.id,
                text: comment.text,
                createdAt: comment.createdAt,
                user: comment.user,
                post: comment.post,
                project: comment.project,
                targetType: comment.postId ? 'POST' : 'PROJECT',
                targetId: comment.postId || comment.projectId
            };
        });

        return serializeForClient({
            comments: formattedComments,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching all comments:", error);
        return serializeForClient({ comments: [], total: 0, pages: 0 });
    }
};

export const deleteComment = async (commentId: string) => {
    try {
        const session = await auth();
        if (!session?.user) return serializeForClient({ success: false, error: "Unauthorized" });

        await prisma.comment.delete({
            where: { id: commentId }
        });

        revalidatePath("/admin/comments");
        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return serializeForClient({ success: false, error: "Failed to delete comment" });
    }
};

export const bulkDeleteComments = async (ids: string[]) => {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Unauthorized" };

        await prisma.comment.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        revalidatePath("/admin/comments");
        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting comments:", error);
        return { success: false, error: "Failed to delete comments" };
    }
};
