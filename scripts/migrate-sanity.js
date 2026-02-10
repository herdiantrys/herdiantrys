
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('next-sanity');

// Use updated config for script
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2024-01-01",
    useCdn: false,
});

async function migrate() {
    console.log('Starting migration from Sanity to Local DB...');

    // CLEANUP
    console.log('Cleaning up old data...');
    await prisma.project.deleteMany();
    await prisma.service.deleteMany();
    await prisma.partner.deleteMany();
    await prisma.testimonial.deleteMany();
    // Use deleteMany for User only if you want to wipe users (risky for auth). 
    // We stick to upsert for users.

    // CLEANUP
    console.log('Cleaning up old data...');
    await prisma.project.deleteMany();
    await prisma.service.deleteMany();
    await prisma.partner.deleteMany();
    await prisma.testimonial.deleteMany();

    // 1. Migrate Users
    const users = await client.fetch(`*[_type == "profile"] { 
     // Fetch generic profile as Admin
     fullName, headline, bio, location, email, phoneNumber,
     "resumeURL": resumeURL.asset->url,
     "imageUrl": profileImage.asset->url,
     "aboutImageUrl": aboutImage.asset->url,
     socialMedia, skills, experience, education, _updatedAt, _createdAt 
  }`);
    // ... (lines 30-78 omitted for brevity, assuming they are kept or I need to be careful with replace)
    // Wait, I am replacing a huge chunk. I should target specific blocks.

    // Strategy: 
    // 1. Insert CLEANUP at start.
    // 2. Fix PROJECT loop.

    // Let's do 2 calls.
    // Call 1: Insert Cleanup at top of function.
    // Call 2: Fix Project loop at bottom.

    // Actually I can do it in one MultiReplace if I am careful.
    // Or just REPLACE the whole function body if I had it.

    // Let's just use MultiReplace.


    // Also fetch "user" type for authentication data if exists
    const authUsers = await client.fetch(`*[_type == "user"]`);

    // Simple Merge Logic: Create Admin from Profile, Create others from User
    if (users.length > 0) {
        const p = users[0]; // Main profile
        console.log('Migrating Admin Profile...');
        await prisma.user.upsert({
            where: { email: p.email || 'admin@example.com' },
            update: {
                username: 'herdiantry',
                name: p.fullName,
                headline: Array.isArray(p.headline) ? p.headline.join(' | ') : p.headline,
                bio: p.bio ? JSON.stringify(p.bio) : null,
                location: p.location,
                bio: p.bio ? JSON.stringify(p.bio) : null,
                location: p.location,
                image: p.imageUrl,
                bannerImage: p.aboutImageUrl, // Map aboutImage to bannerImage
                phoneNumber: p.phoneNumber,
                resumeURL: p.resumeURL,
                socialLinks: p.socialMedia || [],
                skills: p.skills || [],
                experience: p.experience || [],
                education: p.education || []
            },
            create: {
                username: 'herdiantry',
                email: p.email || 'admin@example.com',
                name: p.fullName,
                headline: Array.isArray(p.headline) ? p.headline.join(' | ') : p.headline,
                bio: p.bio ? JSON.stringify(p.bio) : null,
                location: p.location,
                location: p.location,
                image: p.imageUrl,
                bannerImage: p.aboutImageUrl, // Map aboutImage to bannerImage
                role: 'ADMIN',
                phoneNumber: p.phoneNumber,
                resumeURL: p.resumeURL,
                socialLinks: p.socialMedia || [],
                skills: p.skills || [],
                experience: p.experience || [],
                education: p.education || [],
                createdAt: new Date(p._createdAt || Date.now())
            }
        });
    }

    // Migrate Auth Users
    for (const u of authUsers) {
        if (u.email === users[0]?.email) continue; // Skip if same as admin
        const email = u.email || `user-${u.username}@noemail.com`;
        await prisma.user.upsert({
            where: { email: email },
            update: {},
            create: {
                username: u.username,
                name: u.fullName,
                email: email,
                image: u.imageURL, // or u.profileImage.asset->url
                points: u.points || 0,
                role: 'USER'
            }
        });
        console.log(`Migrated Auth User: ${u.username}`);
    }

    // 2. Migrate Services
    const services = await client.fetch(`*[_type == "service"]{
      _id, title, description, price, "imageUrl": image.asset->url, features, buttonText, orderLink
  }`);
    for (const s of services) {
        await prisma.service.create({
            data: {
                title: s.title,
                description: s.description,
                price: s.price ? Math.round(s.price) : 0,
                imageUrl: s.imageUrl,
                features: s.features || [],
                buttonText: s.buttonText,
                orderLink: s.orderLink
            }
        });
    }
    console.log(`Migrated ${services.length} Services.`);

    // 3. Migrate Partners
    const partners = await client.fetch(`*[_type == "partner"]{ _id, name, "icon": icon.asset->url, url }`);
    for (const p of partners) {
        await prisma.partner.create({
            data: {
                name: p.name,
                icon: p.icon,
                url: p.url
            }
        });
    }
    console.log(`Migrated ${partners.length} Partners.`);

    // 4. Migrate Testimonials
    const testimonials = await client.fetch(`*[_type == "testimonial"]{ _id, name, role, testimonial, "photo": photo.asset->url }`);
    for (const t of testimonials) {
        await prisma.testimonial.create({
            data: {
                name: t.name,
                role: t.role,
                content: t.testimonial,
                photo: t.photo
            }
        });
    }
    console.log(`Migrated ${testimonials.length} Testimonials.`);

    // 5. Migrate Projects (Previous logic)
    const projects = await client.fetch(`*[_type == "project"]{
    _id, title, slug, description, "category": category->slug.current, 
    album, type, content, uploadDate, views, favorite, tags, 
    "imageUrl": image.asset->url, repoUrl, demoUrl, _createdAt, _updatedAt
  }`);

    for (const p of projects) {
        const exists = await prisma.project.findUnique({ where: { slug: p.slug.current } });
        if (exists) continue;

        let catId = null;
        if (p.category) {
            const cat = await prisma.category.upsert({
                where: { slug: p.category },
                update: {},
                create: { title: p.category, slug: p.category }
            });
            catId = cat.id;
        }

        await prisma.project.create({
            data: {
                // id: p._id, // Let Prisma generate CUID to avoid format issues or collision
                title: p.title,
                slug: p.slug.current,
                description: p.description,
                type: p.type === 'video' ? 'VIDEO' : 'IMAGE',
                image: p.imageUrl,
                tags: p.tags ? p.tags.join(',') : null,
                category: catId ? { connect: { id: catId } } : undefined,
                demoUrl: p.demoUrl,
                repoUrl: p.repoUrl,
                views: p.views || 0,
                favorite: p.favorite || false,
                createdAt: new Date(p._createdAt),
                customUpdatedAt: p.uploadDate ? new Date(p.uploadDate) : new Date(p._createdAt),
                author: {
                    connect: { email: users[0]?.email || 'admin@example.com' }
                }
            }
        });
    }
    console.log(`Migrated ${projects.length} Projects.`);

    console.log('Migration Complete.');
}

migrate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
