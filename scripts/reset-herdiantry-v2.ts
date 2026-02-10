
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceReset() {
    try {
        const user = await prisma.user.findUnique({ where: { username: "herdiantry" } });
        if (!user) return console.log("User not found");

        console.log(`Resetting user: ${user.username} (${user.id})`);

        // 1. Reset Coins
        await prisma.user.update({
            where: { id: user.id },
            data: { points: 0 }
        });

        // 2. DELETE existing save (Hard Reset)
        try {
            await prisma.aquariaSave.delete({
                where: { userId: user.id }
            });
            console.log("Deleted old save.");
        } catch (e) {
            console.log("No old save to delete.");
        }

        // 3. CREATE fresh save
        const starterFish = {
            id: `starter-${Date.now()}`,
            type: "guppy",
            level: 1,
            acquiredAt: Date.now()
        };

        const newSave = await prisma.aquariaSave.create({
            data: {
                userId: user.id,
                pearls: 0,
                level: 1,
                exp: 0,
                upgrades: {
                    foodLevel: 1,
                    tankLevel: 1,
                    filterLevel: 0,
                    lightLevel: 0,
                    coralLevel: 0,
                    oxygenLevel: 0,
                    fishLevels: {}
                },
                fishes: [starterFish], // Pass array directly
                decorations: [],
                lastSeen: new Date()
            }
        });

        console.log("Created new save.");
        console.log("Fishes in DB:", newSave.fishes);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

forceReset();
