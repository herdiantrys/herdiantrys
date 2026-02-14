
import prisma from "@/lib/prisma";

async function main() {
    console.log("Seeding Custom Background Image Shop Item...");

    // 1. Create or Find the Shop Item
    const itemName = "Custom Background Image";
    let item = await prisma.shopItem.findFirst({
        where: {
            name: itemName,
            type: "BACKGROUND"
        }
    });

    if (!item) {
        item = await prisma.shopItem.create({
            data: {
                name: itemName,
                description: "Upload your own custom image as your profile background.",
                price: 1500, // Higher price for premium feature
                type: "BACKGROUND",
                value: "custom-image", // Marker value
                icon: "https://cdn.sanity.io/images/q8119565/production/60d81c81062b339486c42935266522c091910609-500x500.png", // Placeholder
                category: "cosmetics"
            }
        });
        console.log("Created shop item:", item);
    } else {
        console.log("Shop item already exists:", item);
    }

    // 2. Grant to User 'herdiantry'
    const username = "herdiantry";
    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user) {
        console.log(`User ${username} not found. Skipping grant.`);
        return;
    }

    const existingInventory = await prisma.userInventory.findUnique({
        where: {
            userId_shopItemId: {
                userId: user.id,
                shopItemId: item.id
            }
        }
    });

    if (!existingInventory) {
        await prisma.userInventory.create({
            data: {
                userId: user.id,
                shopItemId: item.id
            }
        });
        console.log(`Granted '${itemName}' to ${username}.`);
    } else {
        console.log(`User ${username} already has '${itemName}'.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
