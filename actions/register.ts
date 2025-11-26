"use server";

import { writeClient } from "@/sanity/lib/write-client";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
        return { error: "All fields are required" };
    }

    try {
        // Check if user already exists
        const existingUser = await writeClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
        );

        if (existingUser) {
            return { error: "Email already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in Sanity
        await writeClient.create({
            _type: "user",
            fullName,
            username: email.split("@")[0], // Default username from email
            email,
            password: hashedPassword,
            imageURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
    }
}
