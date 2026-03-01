import AdminColorPalettesClient from "@/components/Admin/AdminColorPalettesClient";
import prisma from "@/lib/prisma";

export default async function AdminColorPalettesPage() {
    const [palettes, colors] = await Promise.all([
        prisma.appPalette.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.appColor.findMany({ orderBy: { name: "asc" } }),
    ]);

    return (
        <AdminColorPalettesClient
            initialPalettes={palettes as any}
            allColors={colors.map(c => ({ id: c.id, name: c.name, hex: c.hex, family: c.family }))}
        />
    );
}
