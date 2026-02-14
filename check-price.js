
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking price for Professional Portfolio Template...");
    const item = await prisma.shopItem.findFirst({
        where: { type: 'SAAS_TEMPLATE' }
    });

    if (item) {
        console.log(`Current Price: ${item.price}`);
    } else {
        console.log("Item not found");
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
