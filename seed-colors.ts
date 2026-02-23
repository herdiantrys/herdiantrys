import { PrismaClient } from '@prisma/client'
import { colorsData, palettesData } from './lib/data/colors'

const prisma = new PrismaClient()

async function main() {
    console.log('Clearing existing color data...')
    await prisma.appColor.deleteMany()
    await prisma.appPalette.deleteMany()

    console.log('Seeding solid colors...')
    for (const color of colorsData) {
        await prisma.appColor.create({
            data: {
                name: color.name,
                hex: color.hex,
                rgb: color.rgb,
                cmyk: color.cmyk,
                family: color.family,
            },
        })
    }

    console.log('Seeding color palettes...')
    for (const palette of palettesData) {
        await prisma.appPalette.create({
            data: {
                name: palette.name,
                colors: JSON.stringify(palette.colors),
                tags: JSON.stringify(palette.tags),
            },
        })
    }

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
