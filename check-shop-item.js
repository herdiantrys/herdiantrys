
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for Professional Portfolio Template...");
    const existing = await prisma.shopItem.findFirst({
        where: { type: 'SAAS_TEMPLATE' }
    });

    if (existing) {
        console.log("Item found:", existing);
    } else {
        console.log("Item NOT found. Seeding...");
        await prisma.shopItem.create({
            data: {
                name: "Professional Portfolio Template",
                description: "Unlock the custom portfolio landing page. Stand out with a premium, customizable layout.",
                price: 50,
                type: "SAAS_TEMPLATE",
                value: "portfolio-v1",
                icon: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3"
            }
        });
        console.log("Seeding complete.");
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
