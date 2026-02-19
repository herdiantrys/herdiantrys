"use server";

import prisma from "@/lib/prisma";

export type SearchResults = {
    users: any[];
    projects: any[];
    posts: any[];
};

export async function globalSearch(query: string): Promise<SearchResults> {
    if (!query || query.trim().length === 0) {
        return { users: [], projects: [], posts: [] };
    }

    const cleanQuery = query.trim();


    // Helper to perform safe queries
    const safeSearch = async <T>(promise: Promise<T[]>, label: string): Promise<T[]> => {
        try {
            return await promise;
        } catch (error) {
            console.error(`Error searching ${label}:`, error);
            return [];
        }
    };

    const usersPromise = prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: cleanQuery } },
                { name: { contains: cleanQuery } }
            ],
            AND: {
                status: "ACTIVE"
            }
        },
        take: 10,
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            imageURL: true,
            headline: true,
            role: true,
            equippedEffect: true,
            profileColor: true // @ts-ignore
        }
    });

    const projectsPromise = prisma.project.findMany({
        where: {
            OR: [
                { title: { contains: cleanQuery } },
                { description: { contains: cleanQuery } },
                { tags: { contains: cleanQuery } }
            ],
            status: "PUBLISHED"
        },
        take: 10,
        include: {
            category: true,
            _count: {
                select: { likedBy: true, comments: true }
            }
        }
    });

    const postsPromise = prisma.post.findMany({
        where: {
            text: { contains: cleanQuery },
            isArchived: false
        },
        take: 10,
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    imageURL: true,
                    equippedEffect: true
                }
            },
            _count: {
                select: { likedBy: true, comments: true }
            }
        }
    });

    const [users, projects, posts] = await Promise.all([
        safeSearch(usersPromise, 'users'),
        safeSearch(projectsPromise, 'projects'),
        safeSearch(postsPromise, 'posts')
    ]);


    return { users, projects, posts };
}
