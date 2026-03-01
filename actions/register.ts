"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
        return { error: "All fields are required" };
    }

    try {
        // Check if user already exists (Prisma)
        const existingPrismaUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingPrismaUser) {
            return { error: "Email already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Random Default Profile Picture
        const randomImageId = Math.floor(Math.random() * 5) + 1;
        const defaultImage = `/images/profile-picture-${randomImageId}.png`;

        // Generate unique username
        const username = `${email.split('@')[0]}_${Math.floor(Date.now() / 1000)}`;

        // Check if this is the first user
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? 'SUPER_ADMIN' : 'USER';

        // Create user in Prisma
        await prisma.user.create({
            data: {
                name: fullName,
                email: email,
                username: username,
                password: hashedPassword,
                image: defaultImage,
                role: role,
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: error instanceof Error ? error.message : "Something went wrong. Please try again." };
    }
}
