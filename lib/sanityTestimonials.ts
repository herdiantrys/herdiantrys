import prisma from "@/lib/prisma";

export type Testimonial = {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string;
    color: string;
};

export async function getSanityTestimonials(): Promise<Testimonial[]> {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const colors = [
            "bg-teal-500",
            "bg-cyan-500",
            "bg-emerald-500",
            "bg-teal-600",
            "bg-cyan-600",
        ];

        return testimonials.map((t, index) => ({
            id: t.id,
            name: t.name,
            role: t.role || "Client",
            content: t.content || "",
            avatar: t.photo || t.name.charAt(0).toUpperCase(),
            color: colors[index % colors.length],
        }));
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return [];
    }
}
