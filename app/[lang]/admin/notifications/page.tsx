import { Bell } from "lucide-react";
import { getDictionary } from "@/get-dictionary";
import { getAllNotificationsAdmin } from "@/lib/actions/notification.actions";
import AdminNotificationsClient from "@/components/Admin/AdminNotificationsClient";

export default async function AdminNotificationsPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary((lang || 'en') as "en" | "id");

    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
    const limit = typeof resolvedSearchParams.limit === 'string' ? parseInt(resolvedSearchParams.limit) : 10;
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : "";
    const type = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : "ALL";
    const readStatus = typeof resolvedSearchParams.read === 'string' ? resolvedSearchParams.read : "ALL";

    const { notifications, total, pages } = await getAllNotificationsAdmin({
        page,
        limit,
        search,
        type,
        readStatus: readStatus as any
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all system notifications</p>
                </div>
            </div>

            <AdminNotificationsClient
                initialNotifications={notifications}
                pagination={{
                    currentPage: page,
                    totalPages: pages,
                    totalItems: total,
                    itemsPerPage: limit
                }}
            />
        </div>
    );
}
