import prisma from "@/lib/prisma";
import { Project as PrismaProject, Category } from "@prisma/client";
import { serializeForClient } from "@/lib/utils";

// Define the shape expected by the UI
export type Project = {
  id: string;
  title: string;
  slug: string | { current: string }; // Sanity used object scan, Prisma string. UI might expect object or string.
  // Inspection of sanityProjects.ts before: `slug: project.slug` where sanity returns slug object `{current: ...}` usually.
  // Wait, in previous code: `slug: project.slug`. Sanity query `slug`. If it was whole object, UI handles it.
  // Let's check usage. Usually `slug.current`.
  // Code: `slug` field in Prisma is String.
  // I will return string, but if UI errors, I might need to wrap it.

  category: string;
  thumbnail: string;
  image: string;
  description: string;
  type: string;
  album: string | null;
  uploadDate: string;
  views: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  favorite: boolean;
  tags: string[];
  gallery: { type: 'image' | 'video', url: string }[];
  videoFile?: string | null;
};

export async function getSanityProjects(userId?: string, onlyFavorites: boolean = false, authorId?: string): Promise<Project[]> {
  try {
    const where: any = {
      status: "PUBLISHED",
    };

    if (authorId) {
      where.authorId = authorId;
    } else {
      // Only show official portfolio projects for general lists
      where.author = {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"]
        }
      };
    }

    if (onlyFavorites) {
      where.favorite = true;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { uploadDate: 'desc' },
      include: {
        category: true,
        _count: {
          select: {
            likedBy: true,
            comments: true
          }
        },
        likedBy: userId ? { where: { id: userId } } : false
      }
    });

    return serializeForClient(projects.map((p) => {
      // Parse tags (CSV -> Array)
      const tags = p.tags ? p.tags.split(',').map(t => t.trim()) : [];

      // Parse gallery (Json -> Array)
      const gallery = (p.gallery as any) || [];

      // Is Liked
      const isLiked = userId ? (p.likedBy && p.likedBy.length > 0) : false;

      return {
        id: p.id,
        title: p.title,
        slug: p.slug, // Return string. If UI needs object, use { current: p.slug }
        category: p.category?.title || "Uncategorized",
        thumbnail: p.image || "", // Use main image
        image: p.image || "",
        description: p.description || "",
        // Note: p.content is the full rich text. p.description is short.
        // Original code extracted text from content. Converting JSON content to text is hard here.
        // We'll use p.description field if populated, else empty.
        type: p.type.toLowerCase(),
        album: p.album,
        uploadDate: p.uploadDate.toISOString(),
        views: p.views,
        likes: p._count.likedBy,
        comments: p._count.comments,
        isLiked: isLiked,
        favorite: p.favorite,
        tags: tags,
        videoFile: p.videoFile,
        gallery: gallery.map((g: any) => ({
          type: g.type,
          url: g.url
        }))
      };
    }));
  } catch (error) {
    console.error("Error fetching projects from Prisma:", error);
    return [];
  }
}

export const getSanityProject = async (slug: string, userId?: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: slug },
      include: {
        category: true,
        _count: { select: { likedBy: true, comments: true } },
        likedBy: userId ? { where: { id: userId } } : false,
        comments: {
          include: {
            user: {
              select: {
                username: true,
                image: true,
                equippedEffect: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) return null;

    const tags = project.tags ? project.tags.split(',').map(t => t.trim()) : [];
    const gallery = (project.gallery as any) || [];
    const isLiked = userId ? (project.likedBy && project.likedBy.length > 0) : false;

    return serializeForClient({
      ...project,
      // Map fields
      category: project.category?.title || null,
      thumbnail: project.image,
      image: project.image, // Main image
      videoFile: project.videoFile,
      likes: project._count.likedBy,
      comments: project.comments.map(c => ({
        _id: c.id,
        text: c.text,
        user: {
          username: c.user.username || "User",
          image: c.user.image,
          equippedEffect: c.user.equippedEffect
        },
        createdAt: c.createdAt.toISOString()
      })),
      commentsCount: project._count.comments,
      isLiked,
      tags,
      gallery,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
};
