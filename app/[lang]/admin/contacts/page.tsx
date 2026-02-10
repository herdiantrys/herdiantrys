import { getContacts } from "@/lib/actions/contact.actions";
import AdminContactsClient from "@/components/Admin/AdminContactsClient";

export default async function AdminContactsPage() {
    const { data: contacts } = await getContacts();

    return (
        <AdminContactsClient contacts={contacts || []} />
    );
}
