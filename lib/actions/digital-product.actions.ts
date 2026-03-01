"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDigitalProducts(adminOnly = false) {
    try {
        const whereClause = adminOnly ? {} : { isPublished: true };
        const products = await prisma.digitalProduct.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" }
        });
        return products;
    } catch (error) {
        console.error("Failed to fetch digital products:", error);
        return [];
    }
}

export async function getDigitalProductById(id: string) {
    try {
        const product = await prisma.digitalProduct.findUnique({
            where: { id }
        });
        return product;
    } catch (error) {
        console.error("Failed to fetch digital product:", error);
        return null;
    }
}

export async function getDigitalProductBySlug(slug: string) {
    try {
        const product = await prisma.digitalProduct.findUnique({
            where: { slug }
        });
        return product;
    } catch (error) {
        console.error("Failed to fetch digital product by slug:", error);
        return null;
    }
}

export async function createDigitalProduct(data: any) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const product = await prisma.digitalProduct.create({
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description || "",
                price: parseInt(data.price) || 0,
                currency: data.currency || "IDR",
                category: data.category || "EBOOK",
                coverImage: data.coverImage || "",
                thumbnail: data.thumbnail || "",
                fileUrl: data.fileUrl || "",
                isPublished: data.isPublished || false,
            }
        });

        return { success: true, product };
    } catch (error: any) {
        console.error("Failed to create digital product:", error);
        return { success: false, error: error.message || "Failed to create product" };
    }
}

export async function updateDigitalProduct(id: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const product = await prisma.digitalProduct.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                price: parseInt(data.price),
                currency: data.currency,
                category: data.category,
                coverImage: data.coverImage,
                thumbnail: data.thumbnail,
                fileUrl: data.fileUrl,
                isPublished: data.isPublished,
            }
        });

        return { success: true, product };
    } catch (error: any) {
        console.error("Failed to update digital product:", error);
        return { success: false, error: error.message || "Failed to update product" };
    }
}

export async function deleteDigitalProduct(id: string) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.digitalProduct.delete({
            where: { id }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete digital product:", error);
        return { success: false, error: error.message || "Failed to delete product" };
    }
}
