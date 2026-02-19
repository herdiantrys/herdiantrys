"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { title: 'asc' },
            include: {
                _count: {
                    select: { projects: true }
                }
            }
        });
        return { success: true, data: categories };
    } catch (error) {
        return { success: false, error: "Failed to fetch categories" };
    }
}

export async function createCategory(data: { title: string; description?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const category = await prisma.category.create({
            data: {
                title: data.title,
                slug,
                description: data.description,
            }
        });

        revalidatePath("/admin/categories");
        revalidatePath("/admin/projects");
        return { success: true, data: category };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: "Category with this name already exists" };
        }
        return { success: false, error: error.message };
    }
}

export async function updateCategory(id: string, data: { title: string; description?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const category = await prisma.category.update({
            where: { id },
            data: {
                title: data.title,
                slug, // Update slug if title changes
                description: data.description,
            }
        });

        revalidatePath("/admin/categories");
        revalidatePath("/admin/projects");
        return { success: true, data: category };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: "Category with this name already exists" };
        }
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.category.delete({
            where: { id }
        });

        revalidatePath("/admin/categories");
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
