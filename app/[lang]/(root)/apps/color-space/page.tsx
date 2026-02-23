import ColorSpaceClient from "@/components/ColorSpace/ColorSpaceClient";
import prisma from "@/lib/prisma";

export const metadata = {
    title: "Color Space | Database-Driven Colors",
    description: "Browse curated solid colors, palettes, and calculate math-based color theories.",
};

export default async function ColorSpacePage() {
    // Fetch data from database instead of static sources
    const colors = await prisma.appColor.findMany({
        orderBy: { name: 'asc' }
    });

    const palettes = await prisma.appPalette.findMany({
        orderBy: { name: 'asc' }
    });

    return <ColorSpaceClient colorsData={colors} palettesData={palettes} />;
}
