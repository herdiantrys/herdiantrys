import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/actions/user.actions";
import { urlFor } from "@/sanity/lib/image";
import Shell from "./layout/Shell";

export default async function AppLayoutAdapter({
    children,
    dict
}: {
    children: React.ReactNode,
    dict: any
}) {
    const session = await auth();
    let userData = null;

    if (session?.user?.email) {
        // Fetch from Prisma Source of Truth
        userData = await getUserByEmail(session.user.email);
    }

    // Safe image resolution
    let resolvedImage = null;
    if (userData) {
        if (userData.profileImage) {
            try {
                resolvedImage = urlFor(userData.profileImage).width(100).url();
            } catch (error) {
                // If urlFor fails (e.g. not a Sanity asset), fallback to the raw URL
                resolvedImage = userData.imageURL || userData.profileImage?.asset?.url;
            }
        } else {
            resolvedImage = userData.imageURL;
        }
    }

    // Default placeholder if no image resolved
    if (!resolvedImage && session?.user) {
        resolvedImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "User")}&background=random`;
    }

    const user = session?.user
        ? (() => {
            try {
                // Convert to JSON-safe object
                return JSON.parse(JSON.stringify({
                    name: session.user.name,
                    email: session.user.email,
                    image: resolvedImage,
                    username: userData?.username,
                    equippedEffect: userData?.equippedEffect,
                    equippedFrame: userData?.equippedFrame,
                    equippedBackground: userData?.equippedBackground,
                    profileColor: userData?.profileColor,
                    frameColor: userData?.frameColor,
                    id: userData?._id || session.user.id,
                    points: userData?.points || 0,
                    role: (userData?.role || session.user.role || "user").toLowerCase()
                }));
            } catch (e) {
                console.error("JSON Parse Error in AppLayoutAdapter:", e);
                return null;
            }
        })()
        : null;

    return (
        <Shell dict={dict} user={user} variant={user ? 'default' : 'guest'}>
            {children}
        </Shell>
    );
}
