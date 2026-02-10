
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantFinal() {
    try {
        const user = await prisma.user.findUnique({ where: { username: "herdiantry" } });
        if (!user) {
            console.error("User 'herdiantry' NOT FOUND.");
            return;
        }

        let shopItem = await prisma.shopItem.findFirst({ where: { name: "Custom Background Image" } });
        if (!shopItem) {
            console.error("Shop Item 'Custom Background Image' NOT FOUND. Creating it now...");
            shopItem = await prisma.shopItem.create({
                data: {
                    name: "Custom Background Image",
                    description: "Upload your own custom image as your profile background.",
                    price: 5000000,
                    type: "BACKGROUND",
                    category: "cosmetics",
                    value: "custom-image",
                    icon: "https://cdn.sanity.io/images/cmj5ypd8/production/5fd31e679354c010c2cd83738435122af8687865-512x512.png"
                }
            });
        }

        console.log(`Granting item '${shopItem.name}' (${shopItem.id}) to user '${user.username}' (${user.id})...`);

        const existing = await prisma.inventoryItem.findFirst({
            where: { userId: user.id, shopItemId: shopItem.id }
        });

        if (existing) {
            console.log("User ALREADY OWNS this item.");
        } else {
            await prisma.inventoryItem.create({
                data: {
                    userId: user.id,
                    shopItemId: shopItem.id,
                    isEquipped: false
                }
            });
            console.log("Item GRANTED successfully.");
        }

    } catch (e) {
        console.error("Critical Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

grantFinal();
