
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkShopCompletion() {
    try {
        const totalItems = await prisma.shopItem.findMany();
        console.log(`Total Shop Items in DB: ${totalItems.length}`);
        totalItems.forEach(item => console.log(`- ${item.name} (${item.id})`));

        const users = await prisma.user.findMany({
            include: {
                inventory: {
                    include: { shopItem: true }
                }
            }
        });

        for (const user of users) {
            console.log(`\nUser: ${user.username} (${user.id})`);
            console.log(`  Inventory Count: ${user.inventory.length}`);
            user.inventory.forEach(inv => console.log(`  - ${inv.shopItem.name}`));

            if (user.inventory.length >= totalItems.length) {
                console.log(`  >>> SHOULD HAVE TYCOON BADGE <<<`);
            } else {
                console.log(`  >>> MISSING ${totalItems.length - user.inventory.length} ITEMS <<<`);
                const ownedIds = user.inventory.map(i => i.shopItemId);
                const missing = totalItems.filter(i => !ownedIds.includes(i.id));
                missing.forEach(m => console.log(`    Missing: ${m.name}`));
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkShopCompletion();
