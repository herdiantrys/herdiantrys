import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting global coin reset...");

    const result = await prisma.user.updateMany({
        data: {
            points: 100
        }
    });

    console.log(`Reset coins for ${result.count} users to 100.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
