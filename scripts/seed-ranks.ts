
import { PrismaClient } from '@prisma/client';
import { RANKS } from './lib/constants/gamification';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding ranks...');

    for (const rank of RANKS) {
        const existing = await prisma.rank.findUnique({
            where: { minXP: rank.minXP }
        });

        if (!existing) {
            await prisma.rank.create({
                data: {
                    name: rank.name,
                    minXP: rank.minXP,
                    description: rank.description,
                    image: rank.image
                }
            });
            console.log(`Created rank: ${rank.name}`);
        } else {
            console.log(`Rank already exists: ${rank.name}`);
        }
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
