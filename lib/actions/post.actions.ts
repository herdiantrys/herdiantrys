"use server";

import prisma from "@/lib/prisma";
import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath } from "next/cache";
import { serializeForClient } from "@/lib/utils";
import { createNotification } from "./notification.actions";

export const createPost = async (userId: string, formData: FormData, path: string) => {
    try {
        const title = formData.get("title") as string | null;
        const text = formData.get("text") as string;
        const imageFile = formData.get("image") as File | null;
        const audioFile = formData.get("audio") as File | null;
        const videoFile = formData.get("video") as File | null;
        const authorId = formData.get("authorId") as string || userId;

        let imageUrl = null;
        let videoUrl = null;
        let audioUrl = null;

        if (imageFile && imageFile.size > 0) {
            const asset = await writeClient.assets.upload("image", imageFile, {
                filename: imageFile.name,
            });
            imageUrl = asset.url;
        }

        if (audioFile && audioFile.size > 0) {
            const asset = await writeClient.assets.upload("file", audioFile, {
                filename: audioFile.name,
            });
            audioUrl = asset.url;
        }

        if (videoFile && videoFile.size > 0) {
            const asset = await writeClient.assets.upload("file", videoFile, {
                filename: videoFile.name,
            });
            videoUrl = asset.url;
        }

        await prisma.post.create({
            data: {
                title,
                text,
                image: imageUrl,
                video: videoUrl,
                audio: audioUrl,
                authorId: authorId,
            }
        });

        revalidatePath(path);
        // Also revalidate dashboard if we are not on it, so it stays fresh
        if (path !== "/dashboard") {
            revalidatePath("/dashboard");
        }

        return serializeForClient({ success: true });
    } catch (error: any) {
        console.error("Error creating post:", error);
        return serializeForClient({ success: false, error: error.message || "Failed to create post" });
    }
};

export const toggleArchivePost = async (postId: string, userId: string, alternativeUserId?: string) => {
    try {
        // 1. Verify User Role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        // 2. Fetch current status and author
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { isArchived: true, authorId: true }
        });

        if (!post) return serializeForClient({ success: false, error: "Post not found" });

        // 3. Check permissions (Author OR Admin)
        // Check if author matches EITHER the primary userId (Prisma) OR the alternative (Sanity/Legacy)
        const isAuthor = post.authorId === userId || (alternativeUserId && post.authorId === alternativeUserId);
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

        if (!isAuthor && !isAdmin) {
            console.error("Archive Unauthorized:", { requestingUserId: userId, alternativeUserId, postAuthorId: post.authorId });
            return serializeForClient({ success: false, error: "Unauthorized" });
        }

        const newStatus = !post.isArchived;

        // 3. Update
        await prisma.post.update({
            where: { id: postId },
            data: { isArchived: newStatus }
        });

        revalidatePath("/dashboard");
        return serializeForClient({ success: true, isArchived: newStatus });
    } catch (error) {
        console.error("Error toggling archive:", error);
        return serializeForClient({ success: false, error: "Failed to update post" });
    }
};

export const getPostById = async (postId: string, currentUserId?: string) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        imageURL: true,
                        role: true,
                        equippedEffect: true,
                        // @ts-ignore
                        profileColor: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                username: true,
                                image: true,
                                imageURL: true,
                                equippedEffect: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                _count: {
                    select: {
                        likedBy: true,
                        comments: true
                    }
                },
                likedBy: currentUserId ? {
                    where: { id: currentUserId },
                    select: { id: true }
                } : false,
                bookmarkedBy: currentUserId ? {
                    where: { id: currentUserId },
                    select: { id: true }
                } : false
            }
        });

        if (!post) return null;

        // Safely access optional properties with Any cast due to stale generated types
        // @ts-ignore
        const postAny = post as any;
        const isLiked = currentUserId && postAny.likedBy ? postAny.likedBy.length > 0 : false;
        // @ts-ignore
        const isBookmarked = currentUserId && postAny.bookmarkedBy ? postAny.bookmarkedBy.length > 0 : false;

        return serializeForClient({
            ...postAny,
            author: postAny.author,
            comments: postAny.comments.map((c: any) => ({
                ...c,
                author: c.user // Map user to author for frontend component compatibility
            })),
            isLiked,
            isBookmarked,
            likesCount: postAny._count.likedBy,
            commentsCount: postAny._count.comments
        });

    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
};

export const deletePost = async (postId: string, userId: string) => {
    try {
        // 1. Verify User Role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return serializeForClient({ success: false, error: "Unauthorized" });
        }

        // 2. Fetch post to get image/video URL
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { image: true, video: true }
        });

        if (!post) return serializeForClient({ success: false, error: "Post not found" });

        // 3. Delete from Sanity if assets exist (Best effort)
        // Note: We skip actual Sanity deletion for now as in the image logic, 
        // but we verify we have the fields to do so later.

        // 4. Delete from Database
        await prisma.post.delete({
            where: { id: postId }
        });

        revalidatePath("/admin/posts");
        revalidatePath("/dashboard");

        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error deleting post:", error);
        return serializeForClient({ success: false, error: "Failed to delete post" });
    }
};

export const bulkDeletePosts = async (postIds: string[], userId: string) => {
    try {
        // 1. Verify User Role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return serializeForClient({ success: false, error: "Unauthorized" });
        }

        // 2. Delete posts
        // Note: For strict correctness regarding Sanity images, we'd need to fetch all images first causing extra reads.
        // For bulk operations, we might accept that images might be orphaned in Sanity for now, or implement a cleanup job later.
        // Or we could do:
        // const posts = await prisma.post.findMany({ where: { id: { in: postIds } }, select: { image: true } });
        // ... delete images ...

        await prisma.post.deleteMany({
            where: {
                id: { in: postIds }
            }
        });

        revalidatePath("/admin/posts");
        revalidatePath("/dashboard");

        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error bulk deleting posts:", error);
        return serializeForClient({ success: false, error: "Failed to delete posts" });
    }
};

export const bulkUpdatePostStatus = async (postIds: string[], action: 'ARCHIVE' | 'ACTIVATE', userId: string) => {
    try {
        // 1. Verify User Role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return serializeForClient({ success: false, error: "Unauthorized" });
        }

        // 2. Update status
        const isArchived = action === 'ARCHIVE';

        await prisma.post.updateMany({
            where: {
                id: { in: postIds }
            },
            data: {
                isArchived
            }
        });

        revalidatePath("/admin/posts");
        revalidatePath("/dashboard");

        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error bulk updating posts:", error);
        return serializeForClient({ success: false, error: "Failed to update posts" });
    }
};

export const updatePost = async (postId: string, formData: FormData, userId: string) => {
    try {
        // 1. Verify User Role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return serializeForClient({ success: false, error: "Unauthorized" });
        }

        const title = formData.get("title") as string | null;
        const text = formData.get("text") as string;
        const authorId = formData.get("authorId") as string;

        const imageFile = formData.get("image") as File | null;
        const audioFile = formData.get("audio") as File | null;
        const videoFile = formData.get("video") as File | null;

        const updateData: any = {
            title,
            text,
            authorId
        };

        if (imageFile && imageFile.size > 0) {
            const asset = await writeClient.assets.upload("image", imageFile, { filename: imageFile.name });
            updateData.image = asset.url;
        }

        if (audioFile && audioFile.size > 0) {
            const asset = await writeClient.assets.upload("file", audioFile, { filename: audioFile.name });
            updateData.audio = asset.url;
        }

        if (videoFile && videoFile.size > 0) {
            const asset = await writeClient.assets.upload("file", videoFile, { filename: videoFile.name });
            updateData.video = asset.url;
        }

        // 2. Update Post
        await prisma.post.update({
            where: { id: postId },
            data: updateData
        });

        revalidatePath("/admin/posts");
        revalidatePath("/dashboard");

        return serializeForClient({ success: true });
    } catch (error) {
        console.error("Error updating post:", error);
        return serializeForClient({ success: false, error: "Failed to update post" });
    }
}
export const repostPost = async (originalPostId: string, userId: string, path: string) => {
    try {
        if (!userId) throw new Error("Unauthorized");

        // Fetch original post to check author
        const originalPost = await prisma.post.findUnique({
            where: { id: originalPostId },
            select: { authorId: true }
        });

        if (!originalPost) throw new Error("Post not found");
        if (originalPost.authorId === userId) throw new Error("Cannot repost your own post");

        // 1. Check if already reposted (Simple Repost only)
        // We look for a post by this user that references the original ID and has empty text
        const existingRepost = await prisma.post.findFirst({
            where: {
                authorId: userId,
                originalPostId: originalPostId,
                text: "" // Simple repost
            }
        });

        if (existingRepost) {
            // Undo Repost
            await prisma.post.delete({
                where: { id: existingRepost.id }
            });
            revalidatePath(path);
            if (path !== "/dashboard") revalidatePath("/dashboard");
            return serializeForClient({ success: true, reposted: false });
        } else {
            // Create Repost
            const newRepost = await prisma.post.create({
                data: {
                    text: "", // Empty for simple repost
                    authorId: userId,
                    originalPostId: originalPostId
                }
            });

            // Trigger Notification for the original author
            if (originalPost.authorId !== userId) {
                await createNotification({
                    recipientId: originalPost.authorId,
                    senderId: userId,
                    type: 'repost_post',
                    relatedPostId: originalPostId,
                });
            }

            revalidatePath(path);
            if (path !== "/dashboard") revalidatePath("/dashboard");
            return serializeForClient({ success: true, reposted: true });
        }
    } catch (error: any) {
        console.error("Error reposting:", error);
        return serializeForClient({ success: false, error: error.message || "Failed to repost" });
    }
};
