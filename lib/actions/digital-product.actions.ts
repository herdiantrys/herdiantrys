"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDigitalProducts(adminOnly = false) {
    try {
        const whereClause: any = adminOnly ? {} : { isPublished: true };

        // If there's specific logic for admin vs public, we can keep `isPublished` check.
        // We previously filtered out "cosmetics" or non-standard types for the main inventory.
        // Let's ensure admin can see EVERYTHING, and public sees only what's published.
        if (!adminOnly) {
            // If you still want to hide cosmetics from the main public store view, keep this here:
            // whereClause.category = { not: "cosmetics" };
        }

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
                price: parseInt(data.priceIdr) || parseInt(data.price) || 0, // Fallback to old price if priceIdr missing
                priceIdr: parseInt(data.priceIdr) || 0,
                priceRunes: parseInt(data.priceRunes) || 0,
                currency: data.currency || "IDR",
                category: data.category || "EBOOK",
                type: data.type || "OTHER",
                coverImage: data.coverImage || "",
                thumbnail: data.thumbnail || "",
                fileUrl: data.fileUrl || "",
                icon: data.icon || "",
                value: data.value || "",
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
                price: parseInt(data.priceIdr) || parseInt(data.price) || 0, // Fallback to old price if priceIdr missing
                priceIdr: parseInt(data.priceIdr) || 0,
                priceRunes: parseInt(data.priceRunes) || 0,
                currency: data.currency,
                category: data.category,
                type: data.type,
                coverImage: data.coverImage,
                thumbnail: data.thumbnail,
                fileUrl: data.fileUrl,
                icon: data.icon,
                value: data.value,
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

export async function uploadDigitalProductThumbnail(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        const { uploadLocalFile } = await import("@/lib/upload");

        // Use the existing local upload utility to save in /public/uploads/digitalproducts
        const publicUrl = await uploadLocalFile(file, "digitalproducts");

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error("Thumbnail upload error:", error);
        return { success: false, error: error.message || "Failed to upload thumbnail" };
    }
}
