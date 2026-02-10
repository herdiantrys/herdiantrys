import prisma from "@/lib/prisma";

export type Partner = {
    id: string;
    name: string;
    icon: string;
    iconDark?: string;
    url?: string;
};

export async function getSanityPartners(): Promise<Partner[]> {
    try {
        const partners = await prisma.partner.findMany();

        return partners.map((partner) => ({
            id: partner.id,
            name: partner.name,
            icon: partner.icon || "",
            iconDark: partner.iconDark || undefined,
            url: partner.url || undefined,
        }));
    } catch (error) {
        console.error("Error fetching partners:", error);
        return [];
    }
}
