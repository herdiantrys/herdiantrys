import prisma from "@/lib/prisma";

import AdminPostsClient from "@/components/Admin/AdminPostsClient";
import { auth } from "@/auth";

export default async function AdminPostsPage() {
    const session = await auth();
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: true }
    });

    return (
        <AdminPostsClient posts={posts} currentUserId={session?.user?.id} />
    );
}
