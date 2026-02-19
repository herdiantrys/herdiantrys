"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";

/**
 * Fetch all conversations for the current logged-in user.
 */
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const conversations = await (prisma as any).conversation.findMany({
            where: {
                participants: {
                    some: { id: session.user.id }
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        lastActiveAt: true,
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return { success: true, conversations };
    } catch (error) {
        console.error("Fetch conversations error:", error);
        return { success: false, error: "Failed to fetch conversations" };
    }
}

/**
 * Fetch all messages for a specific conversation.
 */
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // Verify user is participant
        const isParticipant = await (prisma as any).conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { id: session.user.id } }
            }
        });

        if (!isParticipant) return { success: false, error: "Forbidden" };

        const messages = await (prisma as any).message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                        lastActiveAt: true
                    }
                }
            }
        });

        return { success: true, messages };
    } catch (error) {
        console.error("Fetch messages error:", error);
        return { success: false, error: "Failed to fetch messages" };
    }
}

/**
 * Send a message to a user. Creates a conversation if one doesn't exist.
 */
export async function sendMessage(recipientId: string, content: string, attachment?: string, attachmentType?: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    if (session.user.id === recipientId) return { success: false, error: "Cannot message yourself" };

    try {
        // Find existing conversation between these two
        let conversation = await (prisma as any).conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: session.user.id } } },
                    { participants: { some: { id: recipientId } } }
                ]
            }
        });

        if (!conversation) {
            conversation = await (prisma as any).conversation.create({
                data: {
                    participants: {
                        connect: [
                            { id: session.user.id },
                            { id: recipientId }
                        ]
                    }
                }
            });
        }

        const message = await (prisma as any).message.create({
            data: {
                content,
                attachment,
                attachmentType,
                conversationId: conversation.id,
                senderId: session.user.id
            }
        });

        // Update conversation's updatedAt to push it to the top of the list
        await (prisma as any).conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
        });

        revalidatePath("/dashboard");
        return { success: true, message, conversationId: conversation.id };
    } catch (error) {
        console.error("Send message error:", error);
        return { success: false, error: "Failed to send message" };
    }
}

/**
 * Mark all messages in a conversation as read for the current user.
 * (Future enhancement: MessageRead relation is needed for group chats, 
 * but for 1v1 we can just use isRead flag on Message model).
 */
export async function markAsRead(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await (prisma as any).message.updateMany({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                isRead: false
            },
            data: { isRead: true }
        });

        return { success: true };
    } catch (error) {
        console.error("Mark as read error:", error);
        return { success: false, error: "Failed to mark as read" };
    }
}

/**
 * Get total unread message count for the current user.
 */
export async function getUnreadMessageCount() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, count: 0 };

    try {
        const count = await (prisma as any).message.count({
            where: {
                conversation: {
                    participants: { some: { id: session.user.id } }
                },
                senderId: { not: session.user.id },
                isRead: false
            }
        });

        return { success: true, count };
    } catch (error) {
        return { success: false, count: 0 };
    }
}

/**
 * Upload an attachment for a message to Sanity.
 */
export async function uploadMessageAttachment(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        // 5MB Limit
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "File size exceeds 5MB limit" };
        }

        const isImage = file.type.startsWith("image/");
        const assetType = isImage ? "image" : "file";

        const asset = await writeClient.assets.upload(assetType, file, {
            contentType: file.type,
            filename: file.name,
        });

        return {
            success: true,
            url: asset.url,
            type: assetType
        };
    } catch (error) {
        console.error("Upload attachment error:", error);
        return { success: false, error: "Failed to upload attachment" };
    }
}
