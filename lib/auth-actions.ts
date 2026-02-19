"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
        return { error: "Missing required fields" };
    }

    try {
        // Check if user already exists in Prisma
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "User with this email already exists" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique username
        const username = `${email.split('@')[0]}_${Math.floor(Date.now() / 1000)}`;

        // Create user in Prisma
        await prisma.user.create({
            data: {
                name: fullName,
                email: email,
                username: username,
                password: hashedPassword,
                role: 'USER',
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong. Please try again." };
    }
}

import { generatePasswordResetToken, getPasswordResetTokenByToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function forgotPassword(email: string, turnstileToken: string) {
    if (!email || !turnstileToken) {
        return { error: "Missing required fields" };
    }

    // Verify Turnstile Token
    const formData = new FormData();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY || "");
    formData.append('response', turnstileToken);

    try {
        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const turnstileOutcome = await turnstileRes.json();
        if (!turnstileOutcome.success) {
            return { error: "Invalid captcha" };
        }
    } catch (e) {
        console.error("Turnstile validation error", e);
        return { error: "Captcha validation failed" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (!existingUser) {
        // Return success even if user doesn't exist to prevent enumeration
        return { success: true };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
        return { error: "Missing required fields" };
    }

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Invalid token" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.email }
    });

    if (!existingUser) {
        return { error: "User does not exist" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    });

    return { success: true };
}
