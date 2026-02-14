
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const username = "herdiantry";
    const pointsToAdd = 1000;

    console.log(`Looking for user: @${username}...`);

    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user) {
        console.error("User not found!");
        return;
    }

    console.log(`Found user ${user.name} with ${user.points} points.`);
    console.log(`Adding ${pointsToAdd} points...`);

    const updatedUser = await prisma.user.update({
        where: { username },
        data: {
            points: { increment: pointsToAdd }
        }
    });

    console.log(`Success! User now has ${updatedUser.points} points.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
