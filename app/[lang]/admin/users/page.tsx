import prisma from "@/lib/prisma";
import AdminUsersClient from "@/components/Admin/AdminUsersClient";

import { auth } from "@/auth";

export default async function AdminUsersPage() {
    const session = await auth();
    const currentUser = session?.user;

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    posts: true,
                    comments: true,
                    projects: true
                }
            }
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Users
                </h1>
                <span className="text-gray-400 glass px-3 py-1 rounded-full text-sm">
                    Total: <span className="text-teal-400 font-bold">{users.length}</span>
                </span>
            </div>

            <AdminUsersClient users={users} currentUser={currentUser} />
        </div>
    );
}
