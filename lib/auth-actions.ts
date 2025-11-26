"use server";

import { writeClient } from "@/sanity/lib/write-client";
import { client } from "@/sanity/lib/client";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
        return { error: "Missing required fields" };
    }

    try {
        // Check if user already exists
        const existingUser = await client.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
        );

        if (existingUser) {
            return { error: "User with this email already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in Sanity
        await writeClient.create({
            _type: "user",
            fullName,
            email,
            username: email.split("@")[0], // Default username from email
            password: hashedPassword,
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong. Please try again." };
    }
}
