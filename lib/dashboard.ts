import prisma from "@/lib/prisma";
import { serializeForClient } from "@/lib/utils";

export async function getDashboardStats() {
    try {
        const [totalProjects, totalUsers, viewsAggregate] = await Promise.all([
            prisma.project.count({
                where: { status: "PUBLISHED" }
            }),
            prisma.user.count(),
            prisma.project.aggregate({
                _sum: { views: true },
                where: { status: "PUBLISHED" }
            })
        ]);

        const totalViews = viewsAggregate._sum.views || 0;



        return serializeForClient({
            totalProjects: totalProjects || 0,
            totalUsers: totalUsers || 0,
            totalViews: totalViews || 0
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return serializeForClient({ totalProjects: 0, totalUsers: 0, totalViews: 0 });
    }
}

export async function getRecentProjects() {
    try {
        const projects = await prisma.project.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                createdAt: true,
                image: true,
                category: {
                    select: { title: true }
                }
            }
        });

        return serializeForClient(projects.map(p => ({
            _id: p.id,
            title: p.title,
            _createdAt: p.createdAt.toISOString(),
            imageUrl: p.image,
            category: p.category
        })));
    } catch (error) {
        console.error("Error fetching recent projects:", error);
        return serializeForClient([]);
    }
}

export async function getRecentUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true
            }
        });

        return serializeForClient(users.map(u => ({
            _id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            _createdAt: u.createdAt.toISOString()
        })));
    } catch (error) {
        console.error("Error fetching recent users:", error);
        return serializeForClient([]);
    }
}

export async function getRecentUpdates() {
    try {
        const projects = await prisma.project.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                updatedAt: true,
                image: true
            }
        });

        return serializeForClient(projects.map(p => ({
            _id: p.id,
            title: p.title,
            _updatedAt: p.updatedAt.toISOString(),
            imageUrl: p.image
        })));
    } catch (error) {
        console.error("Error fetching recent updates:", error);
        return serializeForClient([]);
    }
}

export async function getPopularProjects() {
    try {
        const projects = await prisma.project.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { views: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                image: true,
                _count: {
                    select: { likedBy: true }
                }
            }
        });

        return serializeForClient(projects.map(p => ({
            _id: p.id,
            title: p.title,
            likesCount: p._count.likedBy,
            imageUrl: p.image
        })));
    } catch (error) {
        console.error("Error fetching popular projects:", error);
        return serializeForClient([]);
    }
}
