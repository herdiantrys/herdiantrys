
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function diagnose() {
    try {
        const username = "herdiantry";
        const user = await prisma.user.findUnique({
            where: { username },
            include: { inventory: { include: { shopItem: true } } }
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        const allItems = await prisma.shopItem.findMany();
        console.log(`Total items in shop: ${allItems.length}`);

        const ownedItems = user.inventory.map(i => i.shopItem);
        const ownedIds = ownedItems.map(i => i.id);

        console.log(`User owned items: ${ownedItems.length}`);
        ownedItems.forEach(i => console.log(` - OWNED: ${i.name} (${i.id})`));

        const missing = allItems.filter(i => !ownedIds.includes(i.id));
        console.log(`Missing items: ${missing.length}`);
        missing.forEach(i => console.log(` - MISSING: ${i.name} (${i.id}) Type: ${i.type} Category: ${i.category}`));

        // Check if tycoon badge is already in user.badges
        const badges: any[] = (user.badges as any[]) || [];
        const hasTycoon = badges.some(b => b.id === "tycoon");
        console.log(`Has Tycoon Badge: ${hasTycoon}`);

        console.log("\nRAW BADGES JSON:");
        console.log(JSON.stringify(user.badges, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
