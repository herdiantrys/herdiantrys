import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client";

export async function getDashboardStats() {
    try {
        const PROJECTS_COUNT_QUERY = defineQuery(`count(*[_type == "project"])`);
        const USERS_COUNT_QUERY = defineQuery(`count(*[_type == "user"])`);
        // Fetch views array instead of using sum() in GROQ
        const VIEWS_QUERY = defineQuery(`*[_type == "project" && defined(views)].views`);

        const [totalProjects, totalUsers, viewsArray] = await Promise.all([
            client.fetch(PROJECTS_COUNT_QUERY),
            client.fetch(USERS_COUNT_QUERY),
            client.fetch(VIEWS_QUERY)
        ]);

        // Calculate sum in JS
        const totalViews = viewsArray.reduce((acc: number, curr: number) => acc + curr, 0);

        console.log("DEBUG STATS FETCH:", { totalProjects, totalUsers, totalViews });

        return {
            totalProjects: totalProjects || 0,
            totalUsers: totalUsers || 0,
            totalViews: totalViews || 0
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { totalProjects: 0, totalUsers: 0, totalViews: 0 };
    }
}

export async function getRecentProjects() {
    try {
        const QUERY = defineQuery(`
            *[_type == "project"] | order(_createdAt desc)[0...5] {
                _id,
                title,
                _createdAt,
                "imageUrl": image.asset->url,
                category->{title}
            }
        `);
        return await client.fetch(QUERY);
    } catch (error) {
        console.error("Error fetching recent projects:", error);
        return [];
    }
}

export async function getRecentUsers() {
    try {
        const QUERY = defineQuery(`
            *[_type == "user"] | order(_createdAt desc)[0...5] {
                _id,
                name,
                email,
                image,
                _createdAt
            }
        `);
        return await client.fetch(QUERY);
    } catch (error) {
        console.error("Error fetching recent users:", error);
        return [];
    }
}

export async function getRecentUpdates() {
    try {
        const QUERY = defineQuery(`
            *[_type == "project"] | order(_updatedAt desc)[0...5] {
                _id,
                title,
                _updatedAt,
                "imageUrl": image.asset->url
            }
        `);
        return await client.fetch(QUERY);
    } catch (error) {
        console.error("Error fetching recent updates:", error);
        return [];
    }
}

export async function getPopularProjects() {
    try {
        const QUERY = defineQuery(`
            *[_type == "project"] | order(count(likes) desc)[0...5] {
                _id,
                title,
                "likesCount": count(likes),
                "imageUrl": image.asset->url
            }
        `);
        return await client.fetch(QUERY);
    } catch (error) {
        console.error("Error fetching popular projects:", error);
        return [];
    }
}
