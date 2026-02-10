
import prisma from "@/lib/prisma";

async function main() {
    console.log("Seeding Custom Background Shop Item...");

    const existingItem = await prisma.shopItem.findFirst({
        where: {
            name: "Custom Color Background",
            type: "BACKGROUND"
        }
    });

    if (existingItem) {
        console.log("Item already exists:", existingItem);
        return;
    }

    const item = await prisma.shopItem.create({
        data: {
            name: "Custom Color Background",
            description: "Customize your profile and post background with any color.",
            price: 500,
            type: "BACKGROUND",
            value: "custom-color", // Marker value
            icon: "https://cdn.sanity.io/images/q8119565/production/60d81c81062b339486c42935266522c091910609-500x500.png" // Placeholder or specific icon
        }
    });

    console.log("Created shop item:", item);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
