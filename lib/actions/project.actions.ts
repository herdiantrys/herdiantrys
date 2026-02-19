"use server";

import { ProjectType, ProjectStatus } from "@prisma/client";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";

// Get all potential authors (users)
export async function getAuthors() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Failed to fetch authors:", error);
        return { success: false, error: "Failed to fetch authors" };
    }
}

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { title: 'asc' }
        });
        return { success: true, data: categories };
    } catch (error) {
        return { success: false, error: "Failed to fetch categories" };
    }
}

export async function getProject(id: string) {
    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: { category: true }
        });
        return { success: true, data: project };
    } catch (error) {
        return { success: false, error: "Failed to fetch project" };
    }
}

export async function createProject(data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        let authorId = session.user.id;

        // Allow Admin/Super Admin to set author
        if (data.authorId && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
            authorId = data.authorId;
        }

        const project = await prisma.project.create({
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                content: data.content,
                type: data.type as ProjectType || "IMAGE",
                image: data.image,
                videoFile: data.videoFile,
                demoUrl: data.demoUrl,
                repoUrl: data.repoUrl,
                tags: data.tags,
                authorId: authorId,
                categoryId: data.categoryId || null,
                favorite: data.favorite || false,
                status: data.status || "PUBLISHED",
                gallery: data.gallery || [],
            }
        });

        revalidatePath("/admin/projects");
        return { success: true, data: project };
    } catch (error: any) {
        console.error("Create project error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProject(id: string, data: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const project = await prisma.project.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                content: data.content,
                type: data.type as ProjectType,
                image: data.image,
                videoFile: data.videoFile,
                demoUrl: data.demoUrl,
                repoUrl: data.repoUrl,
                tags: data.tags,
                // Only update author if admin and provided
                ...(data.authorId && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string) ? { authorId: data.authorId } : {}),
                categoryId: data.categoryId || null,
                favorite: data.favorite,
                status: data.status,
                isArchived: data.status === "ARCHIVED",
                gallery: data.gallery || [],
            }
        });

        revalidatePath("/admin/projects");
        return { success: true, data: project };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({ where: { id } });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkArchiveProjects(ids: string[]) {
    try {
        await prisma.project.updateMany({
            where: { id: { in: ids } },
            data: { isArchived: true }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadProjectAsset(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const type = formData.get("type") as "image" | "file"; // 'file' for video/others

        if (!file) return { success: false, error: "No file uploaded" };

        const asset = await writeClient.assets.upload(type === "image" ? "image" : "file", file, {
            contentType: file.type,
            filename: file.name,
        });

        return { success: true, url: asset.url, assetId: asset._id };
    } catch (error: any) {
        console.error("Upload project asset error:", error);
        return { success: false, error: error.message || "Upload failed" };
    }
}

export async function bulkDeleteProjects(ids: string[]) {
    try {
        await prisma.project.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkUpdateProjectStatus(ids: string[], status: ProjectStatus) {
    try {
        // Handle "ARCHIVED" as a status string or boolean flag if needed. 
        // The project schema has `status` (string) and `isArchived` (boolean).
        // The post logic used isArchived boolean.
        // For project, let's update both to be safe or just status. 
        // Looking at `createProject`, status defaults to "PUBLISHED".
        // `isArchived` is also a field.
        // If status is "ARCHIVED", we set isArchived=true. If "PUBLISHED", isArchived=false.

        const isArchived = status === "ARCHIVED";

        await prisma.project.updateMany({
            where: { id: { in: ids } },
            data: {
                status: status,
                isArchived: isArchived
            }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
export async function incrementView(id: string) {
    try {
        await prisma.project.update({
            where: { id },
            data: { views: { increment: 1 } }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to increment view" };
    }
}
