import { getContacts } from "@/lib/actions/contact.actions";
import AdminContactsClient from "@/components/Admin/AdminContactsClient";

export default async function AdminContactsPage() {
    const result = await getContacts();
    const contacts = result.success ? (result.data as any[]) : [];

    return (
        <AdminContactsClient contacts={contacts} />
    );
}
