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
            details: n.details,
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
    type: 'like_post' | 'comment_post' | 'follow' | 'system' | 'xp_award' | 'coin_award' | 'achievement' | 'badge_awarded';
    relatedPostId?: string;
    relatedCommentId?: string;
    relatedProjectId?: string;
    details?: any;
}

export const createNotification = async ({ recipientId, senderId, type, relatedPostId, relatedCommentId, relatedProjectId, details }: CreateNotificationParams) => {
    console.log(`[createNotification] Attempting to notify ${recipientId} from ${senderId} (type: ${type})`);

    // Self-notification restricted for social actions, but allowed for gamification/system
    const isSocialAction = ['like_post', 'comment_post', 'follow'].includes(type);
    if (recipientId === senderId && isSocialAction) {
        console.log("[createNotification] Self-notification for social action skipped");
        return;
    }

    try {
        await prisma.notification.create({
            data: {
                recipientId,
                senderId,
                type,
                postId: relatedPostId,
                commentId: relatedCommentId,
                projectId: relatedProjectId,
                details: details as any,
                read: false
            }
        });
        console.log("[createNotification] Notification created successfully");
        revalidatePath("/notifications");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating notification:", error);
        return { success: false };
    }
};
