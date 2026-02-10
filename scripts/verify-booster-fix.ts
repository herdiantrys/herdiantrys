import { buyItem } from "@/lib/actions/akuaria.actions";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBoosterFix() {
    const username = "herdiantry";
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        console.error("User not found");
        return;
    }

    // 1. Give Pearls (Cheat for testing)
    await prisma.aquariaSave.update({
        where: { userId: user.id },
        data: { pearls: 500 }
    });
    console.log("Granted 500 pearls for testing.");

    // 2. Buy Booster
    console.log("Attempting to buy booster...");
    const result = await buyItem(user.id, "booster_x2", {});

    // 3. Check Result
    if (result.success && result.newState) {
        console.log("SUCCESS! newState returned:", Object.keys(result.newState));
        console.log("Boost Ends At:", result.newState.upgrades.boostEndsAt);
    } else {
        console.error("FAILURE! Result:", result);
    }
}

verifyBoosterFix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
