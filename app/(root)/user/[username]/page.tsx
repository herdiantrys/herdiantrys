import { auth } from "@/auth";
import UserProfile from "@/components/UserProfile";
import { getUserByUsername } from "@/lib/actions/user.actions";
import { notFound } from "next/navigation";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getUserByUsername(username);
    const session = await auth();

    if (!user) {
        notFound();
    }

    // Check if the logged-in user is the owner of the profile
    // We need to fetch the session user's username from Sanity to compare, 
    // or compare emails if available in both. 
    // Ideally, session.user should have the username.
    // Let's assume session.user.email matches user.email for now as a fallback,
    // or better, fetch the session user's full doc to compare IDs.

    const isOwner = session?.user?.email === user.email;

    return <UserProfile user={user} isOwner={isOwner} />;
}
