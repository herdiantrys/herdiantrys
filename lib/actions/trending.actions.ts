"use server";

import prisma from "@/lib/prisma";

export type TrendingProject = {
    id: string;
    title: string;
    slug: string;
    image: any;
    category: string;
    stats: {
        views: number;
        likes: number;
        comments: number;
    };
    score: number;
    author: {
        name: string;
        image: any;
    }
};

export type TrendingPost = {
    id: string;
    excerpt: string;
    image: string | null;
    stats: {
        likes: number;
        comments: number;
    };
    score: number;
    author: {
        name: string;
        username: string;
        image: string | null;
    };
    createdAt: Date;
};

export const getTrendingProjects = async (): Promise<TrendingProject[]> => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                _count: { select: { likedBy: true, comments: true } },
                category: { select: { title: true } }
            }
        });

        const trends = projects.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            image: p.image,
            category: p.category?.title || "Project",
            stats: {
                views: p.views || 0,
                likes: p._count.likedBy,
                comments: p._count.comments
            },
            score: (p.views || 0) + (p._count.likedBy * 2) + (p._count.comments * 3),
            author: {
                name: "Herdian", // Default for portfolio
                image: null
            }
        }));

        // Sort descending by score and take top 5
        return trends.sort((a, b) => b.score - a.score).slice(0, 5);

    } catch (error) {
        console.error("Error fetching trending projects:", error);
        return [];
    }
};

export const getTrendingPosts = async (): Promise<TrendingPost[]> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const posts = await prisma.post.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                },
                isArchived: false,
                // Ensure we filter out any 'system' or automated posts if identifiable.
                // For now, assuming all posts in 'Post' are valid user content.
                // We could filter by length or image existence if needed.
            },
            include: {
                author: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                        imageURL: true
                    }
                },
                _count: {
                    select: {
                        likedBy: true,
                        comments: true
                    }
                }
            }
        });

        const trends = posts.map((p) => {
            const likes = p._count.likedBy || 0;
            const comments = p._count.comments || 0;
            // Simple scoring: Likes (1pt) + Comments (2pts)
            const score = likes + (comments * 2);

            return {
                id: p.id,
                excerpt: p.text.substring(0, 60), // Snippet of the post
                image: p.image,
                stats: {
                    likes,
                    comments
                },
                score,
                author: {
                    name: p.author.name || "User",
                    username: p.author.username || "user",
                    image: p.author.image || p.author.imageURL
                },
                createdAt: p.createdAt
            };
        });

        // Filter out posts with 0 engagement? Maybe keep them if list is short.
        // User asked for "terbanyak", implies sorting.

        return trends
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

    } catch (e) {
        console.error("Error getTrendingPosts:", e);
        return [];
    }
};
