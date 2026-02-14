import { getUserByEmail } from "@/lib/actions/user.actions";
import { auth } from "@/auth";
import NavbarSwitcher from "./NavbarSwitcher";
import { urlFor } from "@/sanity/lib/image";

export default async function Navbar({ dict }: { dict: any }) {
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

  // Kirim data user (atau null) ke client
  return (
    <NavbarSwitcher
      dict={dict}
      user={
        session?.user
          ? (() => {
            try {
              // Convert to JSON-safe object to avoid serialization errors with dates/buffers if any
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
                id: userData?._id || session.user.id, // Prefer DB ID
                points: userData?.points || 0,
                role: session.user.role
              }));
            } catch (e) {
              console.error("JSON Parse Error in Navbar:", e);
              return null;
            }
          })()
          : null
      }
    />
  );
}
