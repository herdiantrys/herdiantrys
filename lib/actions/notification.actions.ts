"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getNotifications = async (userId: string) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { recipientId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        image: true,
                        imageURL: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        text: true,
                        image: true
                    }
                }
            }
        });

        return notifications.map(n => ({
            _id: n.id,
            type: n.type,
            sender: {
                ...n.sender,
                _id: n.sender.id,
                fullName: n.sender.name,
                imageURL: n.sender.imageURL || n.sender.image,
                profileImage: n.sender.image ? { asset: { url: n.sender.image } } : null
            },
            relatedPost: n.post ? {
                _id: n.post.id,
                text: n.post.text,
                image: n.post.image
            } : null,
            read: n.read,
            createdAt: n.createdAt.toISOString()
        }));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId: string) => {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false };
    }
};

export const markAllNotificationsAsRead = async (userId: string) => {
    try {
        await prisma.notification.updateMany({
            where: { recipientId: userId, read: false },
            data: { read: true }
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false };
    }
};

interface CreateNotificationParams {
    recipientId: string;
    senderId: string;
    type: 'like_post' | 'comment_post' | 'follow' | 'system';
    relatedPostId?: string;
    relatedCommentId?: string;
    relatedProjectId?: string;
}

export const createNotification = async ({ recipientId, senderId, type, relatedPostId, relatedCommentId, relatedProjectId }: CreateNotificationParams) => {
    if (recipientId === senderId && type !== 'system') return;

    try {
        await prisma.notification.create({
            data: {
                recipientId,
                senderId,
                type,
                postId: relatedPostId,
                commentId: relatedCommentId,
                projectId: relatedProjectId,
                read: false
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating notification:", error);
        return { success: false };
    }
};
