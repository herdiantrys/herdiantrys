import { getUserDigitalInventory } from "@/lib/actions/inventory.actions";
import DigitalInventoryClient from "@/components/DigitalProducts/DigitalInventoryClient";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DigitalInventoryPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { success, inventory } = await getUserDigitalInventory();

    if (!success) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-red-500 font-bold">Failed to load inventory. Please try again later.</p>
            </div>
        );
    }

    return <DigitalInventoryClient initialInventory={inventory || []} />;
}
