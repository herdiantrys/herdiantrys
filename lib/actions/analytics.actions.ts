"use server";

import prisma from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth, subYears, startOfYear, endOfYear, format, addHours, startOfHour, endOfHour } from "date-fns";

export async function recordVisit(path: string) {
    try {
        // Exclude API routes, static files, and admin routes from public stats if desired.
        // For now, let's track everything except explicit skips.
        if (path.startsWith("/api") || path.startsWith("/_next") || path.includes("favicon")) return;

        // Simplify paths (e.g., remove language prefix if consistent, or keep it)
        // E.g. /en/works -> /works
        let cleanPath = path;
        const langMatch = path.match(/^\/(en|id)(.*)/);
        if (langMatch) {
            cleanPath = langMatch[2] || "/";
        }

        await prisma.siteVisit.create({
            data: {
                path: cleanPath
            }
        });
    } catch (error) {
        console.error("Failed to record site visit:", error);
    }
}

export type AnalyticsTimelineData = {
    label: string;
    visits: number;
};

export type AnalyticsTopPage = {
    path: string;
    visits: number;
};

export type AnalyticsStatsResponse = {
    success: true;
    totalVisits: number;
    timeline: AnalyticsTimelineData[];
    topPages: AnalyticsTopPage[];
} | {
    success: false;
    error: string;
};

export async function getVisitsStats(range: "day" | "month" | "year" | "hour"): Promise<AnalyticsStatsResponse> {
    try {
        const timeline: AnalyticsTimelineData[] = [];
        let startDate: Date;
        let endDate = new Date();

        if (range === "hour") {
            // Hours of today
            startDate = startOfDay(new Date());
            for (let i = 0; i < 24; i++) {
                const hourStart = addHours(startDate, i);
                const hourEnd = endOfHour(hourStart);
                const count = await prisma.siteVisit.count({ where: { createdAt: { gte: hourStart, lte: hourEnd } } });
                timeline.push({ label: format(hourStart, "HH:mm"), visits: count });
            }
        } else if (range === "day") {
            // Last 7 days
            startDate = startOfDay(subDays(new Date(), 6));
            for (let i = 6; i >= 0; i--) {
                const d = subDays(new Date(), i);
                const start = startOfDay(d);
                const end = endOfDay(d);
                const count = await prisma.siteVisit.count({ where: { createdAt: { gte: start, lte: end } } });
                timeline.push({ label: format(d, "EEE"), visits: count });
            }
        } else if (range === "month") {
            // Last 6 months
            startDate = startOfMonth(subMonths(new Date(), 5));
            for (let i = 5; i >= 0; i--) {
                const d = subMonths(new Date(), i);
                const start = startOfMonth(d);
                const end = endOfMonth(d);
                const count = await prisma.siteVisit.count({ where: { createdAt: { gte: start, lte: end } } });
                timeline.push({ label: format(d, "MMM"), visits: count });
            }
        } else {
            // Last 5 years
            startDate = startOfYear(subYears(new Date(), 4));
            for (let i = 4; i >= 0; i--) {
                const d = subYears(new Date(), i);
                const start = startOfYear(d);
                const end = endOfYear(d);
                const count = await prisma.siteVisit.count({ where: { createdAt: { gte: start, lte: end } } });
                timeline.push({ label: format(d, "yyyy"), visits: count });
            }
        }

        const totalVisits = await prisma.siteVisit.count({
            where: { createdAt: { gte: startDate, lte: endDate } }
        });

        // Get Top Pages in this range
        const topPagesRaw = await prisma.siteVisit.groupBy({
            by: ['path'],
            where: { createdAt: { gte: startDate, lte: endDate } },
            _count: { path: true },
            orderBy: { _count: { path: 'desc' } },
            take: 5
        });

        const topPages = topPagesRaw.map((p: any) => ({
            path: p.path || "/",
            visits: p._count.path
        }));

        return {
            success: true,
            totalVisits,
            timeline,
            topPages
        };
    } catch (error) {
        console.error("Error fetching analytics stats:", error);
        return { success: false, error: "Failed to fetch analytics" };
    }
}
