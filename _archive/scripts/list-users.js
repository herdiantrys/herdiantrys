
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    const user = await prisma.user.findUnique({
        where: { username: 'poggaming01' }
    });
    console.log('Found User:', user);
}

listUsers()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
