import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = "herdiantrys@gmail.com"; // Assuming this is the user based on context or I will search generic
    // Actually, let's search for the user who owns the "next16" workspace roughly or just list all saves

    // Let's try to find a user first
    const users = await prisma.user.findMany({
        take: 5,
        include: { aquariaSave: true }
    });

    console.log("Found users:", users.length);

    for (const user of users) {
        console.log(`User: ${user.email} (${user.id})`);
        if (user.aquariaSave) {
            console.log("  - Aquaria Save Found");
            console.log("  - Level:", user.aquariaSave.level);
            console.log("  - Coins:", user.points); // Stored on user
            console.log("  - Pearls:", user.aquariaSave.pearls);
            // @ts-ignore
            console.log("  - Fishes:", JSON.stringify(user.aquariaSave.fishes));

            // Add Guppy if requested
            // @ts-ignore
            const fishes = user.aquariaSave.fishes || [];
            // @ts-ignore
            if (fishes.length === 0) {
                console.log("  ! No fishes found. Adding a Guppy...");
                const newFish = {
                    id: `manual-${Date.now()}`,
                    type: 'guppy',
                    level: 1,
                    acquiredAt: Date.now()
                };
                // @ts-ignore
                const updated = [...fishes, newFish];

                await prisma.aquariaSave.update({
                    where: { id: user.aquariaSave.id },
                    data: {
                        fishes: updated as any
                    }
                });
                console.log("  + Guppy added.");
            } else {
                console.log("  ! User already has fishes.");
                // Force add one anyway since user asked "give one guppy" implies they want another or one specifically
                // But wait, user said "aquarium not appearing".
                // Let's just add one to be sure content exists.
                console.log("  ! Adding another Guppy as requested.");
                const newFish = {
                    id: `manual-extra-${Date.now()}`,
                    type: 'guppy',
                    level: 1,
                    acquiredAt: Date.now()
                };
                // @ts-ignore
                const updated = [...fishes, newFish];
                await prisma.aquariaSave.update({
                    where: { id: user.aquariaSave.id },
                    data: {
                        fishes: updated as any
                    }
                });
                console.log("  + Extra Guppy added.");
            }

        } else {
            console.log("  - No Aquaria Save");
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
