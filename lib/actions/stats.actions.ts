"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, subMonths, format, endOfMonth, subDays, startOfDay, endOfDay, subYears, startOfYear, endOfYear, addHours, startOfHour, endOfHour } from "date-fns";

export type GrowthData = {
    month: string;
    users: number;
    projects: number;
};

export type EngagementData = {
    subject: string;
    value: number;
    fullMark: number;
};

export type AdminStatsResponse = {
    success: true;
    kpis: { label: string; value: number; trend: string; color: string }[];
    growthData: GrowthData[];
    engagement: EngagementData[];
    portfolioAdoption: { active: number; total: number };
    projectTypes: { image: number; video: number };
} | {
    success: false;
    error: string;
    kpis?: never;
    growthData?: never;
    engagement?: never;
    portfolioAdoption?: never;
    projectTypes?: never;
};

export const getAdminStats = async (): Promise<AdminStatsResponse> => {
    try {
        const [
            userCount,
            projectCount,
            postCount,
            serviceCount,
            shopItemCount,
            commentCount,
            contactCount,
            totalViews,
            activePortfolios,
            imageProjects,
            videoProjects
        ] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.post.count(),
            prisma.service.count(),
            prisma.shopItem.count(),
            prisma.comment.count(),
            prisma.contact.count(),
            prisma.project.aggregate({
                _sum: { views: true }
            }),
            prisma.portfolioConfig.count({ where: { isEnabled: true } }),
            prisma.project.count({ where: { type: 'IMAGE' } }),
            prisma.project.count({ where: { type: 'VIDEO' } })
        ]);

        // Fetch Growth Data (Last 6 Months)
        const growthData: GrowthData[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const [uCount, pCount] = await Promise.all([
                prisma.user.count({
                    where: { createdAt: { gte: start, lte: end } }
                }),
                prisma.project.count({
                    where: { createdAt: { gte: start, lte: end } }
                })
            ]);

            growthData.push({
                month: format(date, "MMM"),
                users: uCount,
                projects: pCount
            });
        }

        // Engagement Data (Radar)
        // Values are arbitrary "full marks" for visualization, ideally scaled
        const engagement: EngagementData[] = [
            { subject: 'Posts', value: postCount, fullMark: Math.max(postCount * 1.5, 10) },
            { subject: 'Comments', value: commentCount, fullMark: Math.max(commentCount * 1.5, 10) },
            { subject: 'Projects', value: projectCount, fullMark: Math.max(projectCount * 1.5, 10) },
            { subject: 'Users', value: userCount, fullMark: Math.max(userCount * 1.5, 10) },
            { subject: 'Messages', value: contactCount, fullMark: Math.max(contactCount * 1.5, 10) },
        ];

        return {
            success: true,
            kpis: [
                { label: "Total Users", value: userCount, trend: "+12%", color: "#3B82F6" },
                { label: "Projects", value: projectCount, trend: "+5%", color: "#A855F7" },
                { label: "Posts", value: postCount, trend: "+18%", color: "#10B981" },
                { label: "Engagement", value: commentCount + postCount, trend: "+25%", color: "#F59E0B" },
                { label: "Total Views", value: totalViews._sum.views || 0, trend: "+40%", color: "#EC4899" },
            ],
            growthData,
            engagement,
            portfolioAdoption: { active: activePortfolios, total: userCount },
            projectTypes: { image: imageProjects, video: videoProjects }
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return { success: false, error: "Failed to fetch dashboard data" };
    }
};

export const getGrowthStats = async (range: "year" | "month" | "day" | "hour"): Promise<{ success: true, data: GrowthData[] } | { success: false, error: string }> => {
    try {
        const growthData: GrowthData[] = [];

        if (range === "hour") {
            // Hours of today (00:00 to 23:59)
            const todayStart = startOfDay(new Date());
            for (let i = 0; i < 24; i++) {
                const hourStart = addHours(todayStart, i);
                const hourEnd = endOfHour(hourStart);

                const [uCount, pCount] = await Promise.all([
                    prisma.user.count({ where: { createdAt: { gte: hourStart, lte: hourEnd } } }),
                    prisma.project.count({ where: { createdAt: { gte: hourStart, lte: hourEnd } } })
                ]);
                growthData.push({ month: format(hourStart, "HH:mm"), users: uCount, projects: pCount });
            }
        } else if (range === "day") {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = subDays(new Date(), i);
                const start = startOfDay(date);
                const end = endOfDay(date);

                const [uCount, pCount] = await Promise.all([
                    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
                    prisma.project.count({ where: { createdAt: { gte: start, lte: end } } })
                ]);
                growthData.push({ month: format(date, "EEE"), users: uCount, projects: pCount });
            }
        } else if (range === "month") {
            // Last 6 months
            for (let i = 5; i >= 0; i--) {
                const date = subMonths(new Date(), i);
                const start = startOfMonth(date);
                const end = endOfMonth(date);

                const [uCount, pCount] = await Promise.all([
                    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
                    prisma.project.count({ where: { createdAt: { gte: start, lte: end } } })
                ]);
                growthData.push({ month: format(date, "MMM"), users: uCount, projects: pCount });
            }
        } else if (range === "year") {
            // Last 5 years
            for (let i = 4; i >= 0; i--) {
                const date = subYears(new Date(), i);
                const start = startOfYear(date);
                const end = endOfYear(date);

                const [uCount, pCount] = await Promise.all([
                    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
                    prisma.project.count({ where: { createdAt: { gte: start, lte: end } } })
                ]);
                growthData.push({ month: format(date, "yyyy"), users: uCount, projects: pCount });
            }
        }

        return { success: true, data: growthData };
    } catch (error) {
        console.error("Error fetching growth stats:", error);
        return { success: false, error: "Failed to fetch growth data" };
    }
};
