"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, subMonths, format, endOfMonth } from "date-fns";

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
} | {
    success: false;
    error: string;
    kpis?: never;
    growthData?: never;
    engagement?: never;
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
            totalViews
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
            })
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
            engagement
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return { success: false, error: "Failed to fetch dashboard data" };
    }
};
