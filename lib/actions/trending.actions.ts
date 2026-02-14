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
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // 1. Fetch recent posts (last 90 days)
        const recentPosts = await prisma.post.findMany({
            where: {
                createdAt: { gte: ninetyDaysAgo },
                isArchived: false,
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
            },
            take: 100 // Limit to prevent overload, assuming 100 is enough to find "trending"
        });

        // 2. Map and Score
        const mappedRecent = recentPosts.map((p) => {
            const likes = p._count.likedBy || 0;
            const comments = p._count.comments || 0;
            return {
                id: p.id,
                excerpt: p.text ? p.text.substring(0, 60) : (p.image ? "Image Post" : "Post"),
                image: p.image,
                stats: { likes, comments },
                score: likes + (comments * 2),
                author: {
                    name: p.author.name || "User",
                    username: p.author.username || "user",
                    image: p.author.image || p.author.imageURL
                },
                createdAt: p.createdAt
            };
        });

        // 3. Sort by Score
        let topPosts = mappedRecent.sort((a, b) => b.score - a.score).slice(0, 5);

        // 4. Fallback: If less than 5, fetch all-time best (if simpler, just fetch latest unlimited by date but sorted by something else? 
        // Or just fetch random recent ones?
        // Let's just fetch all-time most liked if we don't have enough.
        // Prisma doesn't support sorting by related count easily in `findMany` yet without aggregations or raw query.
        // So we just fetch more recent posts if we didn't fill the quota? 
        // Actually, if we scraped 100 recent posts and didn't find 5, the site is very empty.
        // But if filtering by 90 days returned 0 posts, we need to go back further.

        if (topPosts.length < 5) {
            const existingIds = topPosts.map(p => p.id);
            const olderPosts = await prisma.post.findMany({
                where: {
                    id: { notIn: existingIds },
                    isArchived: false,
                },
                include: {
                    author: { select: { name: true, username: true, image: true, imageURL: true } },
                    _count: { select: { likedBy: true, comments: true } }
                },
                orderBy: { createdAt: 'desc' }, // Just get latest if not enough trending
                take: 10 // Get some candidates
            });

            const mappedOlder = olderPosts.map((p) => {
                const likes = p._count.likedBy || 0;
                const comments = p._count.comments || 0;
                return {
                    id: p.id,
                    excerpt: p.text ? p.text.substring(0, 60) : (p.image ? "Image Post" : "Post"),
                    image: p.image,
                    stats: { likes, comments },
                    score: likes + (comments * 2),
                    author: {
                        name: p.author.name || "User",
                        username: p.author.username || "user",
                        image: p.author.image || p.author.imageURL
                    },
                    createdAt: p.createdAt
                };
            });

            // Sort older ones too just in case
            const sortedOlder = mappedOlder.sort((a, b) => b.score - a.score);

            // Merge
            topPosts = [...topPosts, ...sortedOlder].slice(0, 5);
        }

        return topPosts;

    } catch (e) {
        console.error("Error getTrendingPosts:", e);
        return [];
    }
};
