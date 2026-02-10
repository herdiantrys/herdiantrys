
import prisma from "@/lib/prisma";

async function check() {
    const user = await prisma.user.findUnique({ where: { id: "test_user_tank_bug" } });
    const save = await prisma.aquariaSave.findUnique({ where: { userId: "test_user_tank_bug" } });
    console.log("User Points:", user?.points);
    console.log("Tank Level:", save?.upgrades?.tankLevel);
}
check();
