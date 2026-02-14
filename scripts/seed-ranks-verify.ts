
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const RANKS = [
    { name: "Wanderer (Pengembara)", minXP: 0, description: "User baru. Masih menjelajah dunia tanpa reputasi.", image: "/images/ranks/RANK 1_Wanderer.png" },
    { name: "Initiate (Inisiat)", minXP: 100, description: "Mulai memahami sistem, sudah menyelesaikan tugas dasar.", image: "/images/ranks/RANK 2_Initiate.png" },
    { name: "Apprentice (Murid Petualang)", minXP: 300, description: "Skill mulai terbentuk, dipercaya menjalankan misi kecil.", image: "/images/ranks/RANK 3_Apprentice.png" },
    { name: "Ranger (Penjelajah)", minXP: 700, description: "Sudah aktif dan konsisten. Mulai dikenal komunitas.", image: "/images/ranks/RANK 4_Ranger.png" },
    { name: "Knight of the Realm", minXP: 1500, description: "User loyal. Status mulai prestisius.", image: "/images/ranks/RANK 5_Knight of the Realm.png" },
    { name: "Spellblade", minXP: 3000, description: "Gabungan skill & pengalaman — aktif dan produktif.", image: "/images/ranks/RANK 6_Spellblade.png" },
    { name: "Champion", minXP: 6000, description: "Sudah elite. Bisa diberi privilege khusus di web.", image: "/images/ranks/RANK 7_Champion.png" },
    { name: "High Warden", minXP: 10000, description: "Penjaga dunia. User senior dengan kontribusi besar.", image: "/images/ranks/RANK 8_High Warden.png" },
    { name: "Archlegend", minXP: 15000, description: "Nama mereka dikenal — rank langka.", image: "/images/ranks/RANK 9_Archlegend.png" },
    { name: "Eternal Sovereign", minXP: 25000, description: "Rank tertinggi. Status hampir mitologi.", image: "/images/ranks/RANK 10_Eternal Sovereign.png" }
];

async function main() {
    console.log('Start seeding ranks...');

    for (const rank of RANKS) {
        const existingRank = await prisma.rank.findUnique({
            where: { minXP: rank.minXP },
        });

        if (!existingRank) {
            await prisma.rank.create({
                data: rank,
            });
            console.log(`Created rank: ${rank.name}`);
        } else {
            // Optional: Update if exists to ensure data consistency
            await prisma.rank.update({
                where: { id: existingRank.id },
                data: rank,
            });
            console.log(`Updated rank: ${rank.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
