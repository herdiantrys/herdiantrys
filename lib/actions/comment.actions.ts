"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";

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
                        equippedBackground: true
                    }
                }
            }
        });

        return comments.map(c => ({
            _id: c.id,
            text: c.text,
            createdAt: c.createdAt.toISOString(),
            user: {
                _id: c.user.id,
                fullName: c.user.name || "User",
                username: c.user.username || "user",
                imageURL: c.user.imageURL || c.user.image || "",
                profileImage: c.user.image ? { asset: { url: c.user.image } } : null,
                equippedEffect: c.user.equippedEffect || undefined,
                equippedFrame: c.user.equippedFrame || undefined,
                equippedBackground: c.user.equippedBackground || undefined
            }
        }));
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
};

import { auth } from "@/auth";

export const createComment = async (targetId: string, targetType: "project" | "post", text: string) => {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

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
                        equippedFrame: true, equippedBackground: true
                    }
                },
                post: { select: { authorId: true } },
                project: { select: { authorId: true } }
            }
        });

        // Trigger Notification
        let recipientId = "";
        if (targetType === 'post' && newComment.post) {
            recipientId = newComment.post.authorId;
        } else if (targetType === 'project' && newComment.project) {
            recipientId = newComment.project.authorId;
        }

        if (recipientId && recipientId !== userId) {
            await createNotification({
                recipientId,
                senderId: userId,
                type: 'comment_post',
                relatedPostId: targetType === 'post' ? targetId : undefined,
                relatedProjectId: targetType === 'project' ? targetId : undefined,
                relatedCommentId: newComment.id
            });
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
                equippedBackground: createdComment.user.equippedBackground || undefined
            }
        };

        return { success: true, comment: commentObj };
    } catch (error) {
        console.error("Error creating comment:", error);
        return { success: false, error: "Failed to create comment" };
    }
};
