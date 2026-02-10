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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Posts
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 glass px-3 py-1 rounded-full text-sm">
                        Total: <span className="text-teal-400 font-bold">{posts.length}</span>
                    </span>

                </div>
            </div>

            <AdminPostsClient posts={posts} currentUserId={session?.user?.id} />
        </div>
    );
}
