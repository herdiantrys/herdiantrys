import { buyItem, getGameState } from "@/lib/actions/akuaria.actions";
import { calculateFishPrice, FISH_STATS } from "@/lib/akuaria.shared";
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const LOG_FILE = "verification_output.txt";

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + "\n");
}

async function verifyFishPrice() {
    fs.writeFileSync(LOG_FILE, ""); // Clear file
    const username = "herdiantry";
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        log("User not found");
        return;
    }

    // 1. Reset State (0 Fish, 1000 Coins)
    await prisma.aquariaSave.upsert({
        where: { userId: user.id },
        update: {
            fishes: [],
            upgrades: { foodLevel: 1, tankLevel: 1, fishLevels: {} } as any,
        },
        create: {
            userId: user.id,
            fishes: [],
            upgrades: { foodLevel: 1, tankLevel: 1, fishLevels: {} },
            pearls: 0,
            level: 1,
            exp: 0,
            lastSeen: new Date()
        }
    });

    await prisma.user.update({
        where: { id: user.id },
        data: { points: 1000 }
    });
    log("Reset state: 0 Fish, 1000 Coins");

    // 2. Buy 1st Guppy
    const type = "guppy";
    const basePrice = FISH_STATS[type].price;
    log(`Base Price for ${type}: ${basePrice}`);

    const expectedCost1 = calculateFishPrice(type, 0);
    log(`Expected Cost 1 (0 owned): ${expectedCost1}`);

    log("Buying 1st Guppy...");
    const res1 = await buyItem(user.id, "fish", { type });

    // Ignore revalidatePath error
    if (!res1.success) {
        if (res1.error?.includes("Invariant") || res1.error?.includes("static generation")) {
            log("Ignored revalidatePath error.");
        } else {
            log(`Buy 1 failed: ${res1.error}`);
            return;
        }
    }

    // Verify with DB
    const userAfter1 = await prisma.user.findUnique({ where: { id: user.id } });
    const actualCoins1 = userAfter1?.points;

    log(`Coins after buy 1: DB=${actualCoins1}`);
    log(`Deducted: ${1000 - (actualCoins1 || 0)}`);

    if (1000 - (actualCoins1 || 0) !== expectedCost1) {
        log(`MISMATCH! Expected deduction ${expectedCost1}, got ${1000 - (actualCoins1 || 0)}`);
    } else {
        log("MATCH 1!");
    }

    // 3. Buy 2nd Guppy
    const expectedCost2 = calculateFishPrice(type, 1);
    log(`Expected Cost 2 (1 owned): ${expectedCost2}`);

    log("Buying 2nd Guppy...");
    const res2 = await buyItem(user.id, "fish", { type });

    if (!res2.success) {
        if (res2.error?.includes("Invariant") || res2.error?.includes("static generation")) {
            log("Ignored revalidatePath error.");
        } else {
            log(`Buy 2 failed: ${res2.error}`);
            return;
        }
    }

    const userAfter2 = await prisma.user.findUnique({ where: { id: user.id } });
    const actualCoins2 = userAfter2?.points;

    log(`Coins after buy 2: DB=${actualCoins2}`);
    log(`Deducted: ${(actualCoins1 || 0) - (actualCoins2 || 0)}`);

    if ((actualCoins1 || 0) - (actualCoins2 || 0) !== expectedCost2) {
        log(`MISMATCH! Expected deduction ${expectedCost2}, got ${(actualCoins1 || 0) - (actualCoins2 || 0)}`);
    } else {
        log("MATCH 2!");
    }

}

verifyFishPrice()
    .catch((e) => log(e.toString()))
    .finally(() => prisma.$disconnect());
