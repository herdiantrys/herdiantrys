import prisma from "@/lib/prisma";

export const getServices = async () => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { createdAt: 'asc' }
        });

        return JSON.parse(JSON.stringify(services.map(service => ({
            _id: service.id,
            title: service.title,
            description: service.description,
            price: service.price || 0,
            imageUrl: service.imageUrl,
            features: (service.features as any) || [],
            buttonText: service.buttonText,
            orderLink: service.orderLink
        }))));
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
};
