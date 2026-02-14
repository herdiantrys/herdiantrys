
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Updating price for Professional Portfolio Template...");
    const item = await prisma.shopItem.findFirst({
        where: { type: 'SAAS_TEMPLATE' }
    });

    if (item) {
        await prisma.shopItem.update({
            where: { id: item.id },
            data: { price: 50000 }
        });
        console.log("Price updated to 50000.");
    } else {
        console.log("Item not found.");
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
