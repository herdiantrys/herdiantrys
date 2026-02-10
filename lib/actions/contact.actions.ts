"use server";

import prisma from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { trackContactMessage } from "@/lib/actions/gamification.actions";

export async function sendContactMessage(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
        return { error: "All fields are required" };
    }

    try {
        await prisma.contact.create({
            data: {
                name,
                email,
                message
            }
        });
        revalidatePath("/admin/contacts");
        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Failed to send message" };
    }
}

export async function getContacts() {
    try {
        const contacts = await prisma.$queryRaw`SELECT * FROM Contact ORDER BY createdAt DESC`;
        return { success: true, data: contacts };
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return { success: false, error: "Failed to fetch contacts" };
    }
}

export async function markAsRead(id: string) {
    try {
        await prisma.$executeRaw`UPDATE Contact SET isRead = true WHERE id = ${id}`;
        revalidatePath("/admin/contacts");
        return { success: true };
    } catch (error) {
        console.error("Error marking contact as read:", error);
        return { success: false, error: "Failed to mark as read" };
    }
}

export async function deleteContact(id: string) {
    try {
        await prisma.contact.delete({
            where: { id }
        });
        revalidatePath("/admin/contacts");
        return { success: true };
    } catch (error) {
        console.error("Error deleting contact:", error);
        return { success: false, error: "Failed to delete contact" };
    }
}

export async function bulkDeleteContacts(ids: string[]) {
    try {
        await prisma.contact.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        revalidatePath("/admin/contacts");
        return { success: true };
    } catch (error) {
        console.error("Error bulk deleting contacts:", error);
        return { success: false, error: "Failed to delete contacts" };
    }
}

export async function getUnreadMessageCount() {
    try {
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM Contact WHERE isRead = false` as any[];
        const count = result[0]?.count ? Number(result[0].count) : 0;
        return { success: true, count };
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return { success: false, count: 0 };
    }
}
