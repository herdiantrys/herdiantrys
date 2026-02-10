import { auth } from "@/auth";
import GlobalNavbarClient from "./GlobalNavbarClient";

import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export default async function GlobalNavbar({ dict }: { dict: any }) {
    const session = await auth();
    let userData = null;

    if (session?.user?.email) {
        const USER_QUERY = defineQuery(`
            *[_type == "user" && lower(email) == lower($email)][0] {
                _id,
                points,
                username,
                imageURL,
                profileImage
            }
        `);
        userData = await client.withConfig({ useCdn: false }).fetch(USER_QUERY, { email: session.user.email }, { cache: 'no-store' });
        console.log("GlobalNavbar Debug - User:", session.user.email, "Points:", userData?.points);
    }

    return (
        <GlobalNavbarClient
            user={
                session?.user
                    ? {
                        name: session.user.name,
                        email: session.user.email,
                        image: (userData?.profileImage ? urlFor(userData.profileImage).width(100).url() : null) || userData?.imageURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "User")}&background=random`,
                        username: userData?.username,
                        id: userData?._id,
                        points: userData?.points || 0
                    }
                    : null
            }
            dict={dict}
        />
    );
}
