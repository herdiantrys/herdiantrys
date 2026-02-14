
import { PrismaClient } from '@prisma/client';
import { trackLike } from '@/lib/actions/gamification.actions';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Like Achievements...');

    const user = await prisma.user.findFirst();
    const projects = await prisma.project.findMany({ take: 2 });

    if (!user || projects.length < 2) {
        console.error('Need at least 1 user and 2 projects.');
        return;
    }

    console.log(`Testing with User: ${user.email}`);

    try {
        // simulate like on project 1
        console.log(`Simulating like on Project 1 (${projects[0].id})...`);
        await trackLike(user.id, projects[0].id);

        // check state
        let u = await prisma.user.findUnique({ where: { id: user.id } });
        let state: any = u?.gamificationState || {};
        console.log('State after 1st like:', state.likedProjects);

        // simulate like on project 1 AGAIN (should not increase unique count)
        console.log(`Simulating like on Project 1 AGAIN...`);
        await trackLike(user.id, projects[0].id);

        u = await prisma.user.findUnique({ where: { id: user.id } });
        state = u?.gamificationState || {};
        console.log('State after 2nd like (same project):', state.likedProjects);

        // simulate like on project 2
        console.log(`Simulating like on Project 2 (${projects[1].id})...`);
        await trackLike(user.id, projects[1].id);

        u = await prisma.user.findUnique({ where: { id: user.id } });
        state = u?.gamificationState || {};
        console.log('State after 3rd like (diff project):', state.likedProjects);

    } catch (e) {
        console.error(e);
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
