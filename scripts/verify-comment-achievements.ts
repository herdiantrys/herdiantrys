
import { PrismaClient } from '@prisma/client';
import { trackComment } from '@/lib/actions/gamification.actions';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Comment Achievements...');

    const user = await prisma.user.findFirst();
    // Get multiple projects to test unique tracking
    const projects = await prisma.project.findMany({ take: 2 });

    if (!user || projects.length < 2) {
        console.error('Need at least 1 user and 2 projects.');
        return;
    }

    console.log(`Testing with User: ${user.email}`);

    try {
        // simulate comment on project 1
        console.log(`Simulating comment on Project 1 (${projects[0].id})...`);
        await trackComment(user.id, projects[0].id);

        // check state
        let u = await prisma.user.findUnique({ where: { id: user.id } });
        let state: any = u?.gamificationState || {};
        console.log('State after 1st comment:', state.commentedProjects);

        // simulate comment on project 1 AGAIN (should not increase unique count)
        console.log(`Simulating comment on Project 1 AGAIN...`);
        await trackComment(user.id, projects[0].id);

        u = await prisma.user.findUnique({ where: { id: user.id } });
        state = u?.gamificationState || {};
        console.log('State after 2nd comment (same project):', state.commentedProjects);

        // simulate comment on project 2
        console.log(`Simulating comment on Project 2 (${projects[1].id})...`);
        await trackComment(user.id, projects[1].id);

        u = await prisma.user.findUnique({ where: { id: user.id } });
        state = u?.gamificationState || {};
        console.log('State after 3rd comment (diff project):', state.commentedProjects);

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
