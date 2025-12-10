import { auth } from "@/auth";
import UserProfile from "@/components/UserProfile";
import { getUserByUsername } from "@/lib/actions/user.actions";
import { notFound } from "next/navigation";
import { getDictionary } from "@/get-dictionary";

export default async function ProfilePage({ params }: { params: Promise<{ username: string, lang: string }> }) {
    const { username, lang } = await params;

    // Fetch user and dictionary concurrently if possible, but params needs await? 
    // Wait, params in Next.js 15 is Promise. But in 14 it's not. 
    // The previous code had `params: Promise<...>` so I should respect that structure if it was auto-generated or correct for version. 
    // Let's assume Next.js 15 behavior since previous file had `await params`.

    // Actually, I should update the signature to MATCH what I see in `projects/[slug]/page.tsx` or stick to what was there.
    // Previous file content: `export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) { const { username } = await params; ... }`
    // So I will update params type to Promise<{ username: string, lang: string }> and await it.

    const user = await getUserByUsername(username);
    const session = await auth();
    const dict = await getDictionary((lang || 'en') as "en" | "id");

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

    return (
        <div className="pt-28">
            <UserProfile user={user} isOwner={isOwner} dict={dict} />
        </div>
    );
}
