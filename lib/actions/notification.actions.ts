"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeForClient } from "@/lib/utils";

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
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        slug: true
                    }
                }
            }
        });

        return serializeForClient(notifications.map(n => ({
            _id: n.id,
            type: n.type,
            sender: {
                ...n.sender,
                _id: n.sender.id,
                fullName: n.sender.name,
                imageURL: n.sender.imageURL || n.sender.image,
                profileImage: n.sender.image ? { asset: { url: n.sender.image } } : null
            },
            relatedPost: (n as any).post ? {
                _id: (n as any).post.id,
                text: (n as any).post.text,
                image: (n as any).post.image
            } : null,
            relatedProject: (n as any).project ? {
                _id: (n as any).project.id,
                title: (n as any).project.title,
                image: (n as any).project.image,
                slug: (n as any).project.slug
            } : null,
            read: n.read,
            details: n.details,
            createdAt: n.createdAt.toISOString()
        })));
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
    type: 'like_post' | 'comment_post' | 'like_project' | 'comment_project' | 'repost_post' | 'follow' | 'system' | 'xp_award' | 'coin_award' | 'achievement' | 'badge_awarded';
    relatedPostId?: string;
    relatedCommentId?: string;
    relatedProjectId?: string;
    details?: any;
}

export const createNotification = async ({ recipientId, senderId, type, relatedPostId, relatedCommentId, relatedProjectId, details }: CreateNotificationParams) => {


    // Self-notification restricted for social actions, but allowed for gamification/system
    const isSocialAction = ['like_post', 'comment_post', 'like_project', 'comment_project', 'repost_post', 'follow'].includes(type);
    if (recipientId === senderId && isSocialAction) {

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

        revalidatePath("/notifications");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating notification:", error);
        return { success: false };
    }
};

// ADMIN ACTIONS

import { auth } from "@/auth";

export const getAllNotificationsAdmin = async ({
    page = 1,
    limit = 10,
    search = "",
    type = "ALL",
    readStatus = "ALL"
}: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    readStatus?: "ALL" | "READ" | "UNREAD";
} = {}) => {
    try {
        const session = await auth();
        // In a real app, check for ADMIN role here
        if (!session?.user?.id) {
            return { notifications: [], total: 0, pages: 0 };
        }

        const skip = (page - 1) * limit;

        // Where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { recipient: { username: { contains: search, mode: 'insensitive' } } },
                { recipient: { name: { contains: search, mode: 'insensitive' } } },
                { sender: { username: { contains: search, mode: 'insensitive' } } },
                { sender: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (type && type !== "ALL") {
            where.type = type;
        }

        if (readStatus === "READ") {
            where.read = true;
        } else if (readStatus === "UNREAD") {
            where.read = false;
        }

        const total = await prisma.notification.count({ where });

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip,
            include: {
                recipient: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        imageURL: true
                    }
                },
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        imageURL: true
                    }
                },
                post: { select: { id: true, text: true } },
                project: { select: { id: true, title: true } },
                comment: { select: { id: true, text: true } }
            }
        });

        const formattedNotifications = notifications.map(n => ({
            id: n.id,
            type: n.type,
            read: n.read,
            createdAt: n.createdAt,
            recipient: n.recipient,
            sender: n.sender,
            details: n.details,
            context: n.post ? { type: 'POST', ...n.post } :
                n.project ? { type: 'PROJECT', ...n.project } :
                    n.comment ? { type: 'COMMENT', ...n.comment } : null
        }));

        return serializeForClient({
            notifications: formattedNotifications,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        return { notifications: [], total: 0, pages: 0 };
    }
};

export const deleteNotification = async (id: string) => {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Unauthorized" };

        await prisma.notification.delete({
            where: { id }
        });

        revalidatePath("/admin/notifications");
        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return serializeForClient({ success: false, error: "Failed to delete notification" });
    }
};

export const bulkDeleteNotifications = async (ids: string[]) => {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Unauthorized" };

        await prisma.notification.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        revalidatePath("/admin/notifications");
        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error bulk deleting notifications:", error);
        return serializeForClient({ success: false, error: "Failed to delete notifications" });
    }
};
