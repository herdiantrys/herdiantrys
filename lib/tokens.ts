import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    // Expire in 1 hour
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email }
    });

    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id }
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires
        }
    });

    return passwordResetToken;
}

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });
        return passwordResetToken;
    } catch {
        return null;
    }
}

export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: { email }
        });
        return passwordResetToken;
    } catch {
        return null;
    }
}
