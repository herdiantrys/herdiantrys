import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const settings = await prisma.globalSetting.findUnique({
        where: { id: "main" }
    })

    if (!settings) {
        console.log("No global settings found. Please run init script first.")
        return
    }

    // Current theme fallback or default it
    const currentTheme = settings.theme ? (typeof settings.theme === 'string' ? JSON.parse(settings.theme) : settings.theme) : {};

    const updatedTheme = {
        ...currentTheme,
        accentGradientStart: '#8b5cf6', // Violet 500
        accentGradientEnd: '#6366f1',   // Indigo 500
        accent: '#8b5cf6',
        darkPrimary: '#1A1A1A',
        glassBlur: 20,
        glassOpacity: 0.04,
        glassSaturation: 150
    }

    await prisma.globalSetting.update({
        where: { id: "main" },
        data: {
            theme: updatedTheme
        }
    })

    console.log("Successfully updated the global theme to Violet-Indigo Tab style!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
