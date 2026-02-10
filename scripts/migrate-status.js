const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log('Starting migration...');

    // 1. Update Archved Projects
    const archived = await prisma.project.updateMany({
        where: { isArchived: true },
        data: { status: 'ARCHIVED' }
    });
    console.log(`Updated ${archived.count} archived projects.`);

    // 2. Update Active Projects (default is PUBLISHED, but let's be explicit)
    const active = await prisma.project.updateMany({
        where: { isArchived: false },
        data: { status: 'PUBLISHED' }
    });
    console.log(`Updated ${active.count} active projects.`);

    console.log('Migration complete.');
}

migrate()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
