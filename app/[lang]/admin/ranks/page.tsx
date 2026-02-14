
import { getRanks } from "@/lib/actions/rank.actions";
import AdminRanksClient from "@/components/Admin/AdminRanksClient";

export default async function AdminRanksPage() {
    const ranks = await getRanks();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Rank Definitions
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 glass px-3 py-1 rounded-full text-sm">
                        Total: <span className="text-teal-400 font-bold">{ranks.length}</span>
                    </span>
                </div>
            </div>

            <AdminRanksClient ranks={ranks} />
        </div>
    );
}
