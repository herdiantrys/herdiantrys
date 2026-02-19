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
        <AdminUsersClient users={users} currentUser={currentUser} />
    );
}
