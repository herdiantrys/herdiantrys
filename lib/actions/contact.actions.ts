"use server";

import { writeClient } from "@/sanity/lib/write-client";

export async function sendContactMessage(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
        return { error: "All fields are required" };
    }

    try {
        await writeClient.create({
            _type: "contact",
            name,
            email,
            message,
            createdAt: new Date().toISOString(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error);
        return { error: "Failed to send message" };
    }
}
