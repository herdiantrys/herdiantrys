const { execSync } = require("child_process");
const path = require("path");

const { PrismaClient } = require("@prisma/client");

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const migrations = {
    init: "20260401023000_init",
    addMediaAssets: "20260401023100_add_media_assets",
};

const run = (command) => {
    console.log(`> ${command}`);
    execSync(command, {
        stdio: "inherit",
        env: process.env,
    });
};

async function getExistingTables() {
    const prisma = new PrismaClient();

    try {
        const rows = await prisma.$queryRawUnsafe(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        );

        return new Set(rows.map((row) => row.name));
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const tables = await getExistingTables();
    const hasMigrationHistory = tables.has("_prisma_migrations");
    const hasExistingSchema = tables.has("User");

    if (!hasMigrationHistory && !hasExistingSchema) {
        console.log("Fresh SQLite database detected. Bootstrapping schema with db push.");
        run(`npx prisma db push --skip-generate --schema "${schemaPath}"`);
        return;
    }

    if (!hasMigrationHistory && hasExistingSchema) {
        console.log("Existing SQLite database detected without Prisma migration history.");
        run(`npx prisma migrate resolve --applied ${migrations.init} --schema "${schemaPath}"`);

        if (tables.has("MediaAsset")) {
            run(`npx prisma migrate resolve --applied ${migrations.addMediaAssets} --schema "${schemaPath}"`);
        }
    }

    run(`npx prisma migrate deploy --schema "${schemaPath}"`);
}

main().catch((error) => {
    console.error("Prisma deployment failed.");
    console.error(error);
    process.exit(1);
});
