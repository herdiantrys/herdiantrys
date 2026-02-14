
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Project Views...');

    // 1. Get a user and a project
    const user = await prisma.user.findFirst();
    const project = await prisma.project.findFirst();

    if (!user || !project) {
        console.error('No user or project found to test with.');
        return;
    }

    console.log(`Testing with User: ${user.email} and Project: ${project.title}`);

    // 2. Simulate View
    try {
        // Create a view if not exists
        const existing = await prisma.projectView.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: project.id
                }
            }
        });

        if (existing) {
            console.log('View already exists. Deleting to test creation...');
            await prisma.projectView.delete({
                where: {
                    userId_projectId: {
                        userId: user.id,
                        projectId: project.id
                    }
                }
            });
        }

        const newView = await prisma.projectView.create({
            data: {
                userId: user.id,
                projectId: project.id
            }
        });

        console.log('Successfully created ProjectView:', newView);

        // 3. Check Count
        const count = await prisma.projectView.count({
            where: { userId: user.id }
        });
        console.log(`Total views for user: ${count}`);

    } catch (e) {
        console.error('Error creating ProjectView:', e);
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
