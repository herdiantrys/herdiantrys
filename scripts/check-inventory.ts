
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInventory() {
    try {
        const user = await prisma.user.findUnique({
            where: { username: "herdiantry" },
            include: {
                inventory: {
                    include: { shopItem: true }
                }
            }
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log(`User: ${user.username} (${user.id})`);
        console.log("Inventory Items:");
        user.inventory.forEach(item => {
            console.log(`- ${item.shopItem.name} (Equipped: ${item.isEquipped})`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkInventory();
