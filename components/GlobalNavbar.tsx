import { auth } from "@/auth";
import GlobalNavbarClient from "./GlobalNavbarClient";

import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client";

export default async function GlobalNavbar() {
    const session = await auth();
    let username = null;

    if (session?.user?.email) {
        const USER_QUERY = defineQuery(`*[_type == "user" && email == $email][0].username`);
        username = await client.fetch(USER_QUERY, { email: session.user.email });
    }

    return (
        <GlobalNavbarClient
            user={
                session?.user
                    ? {
                        name: session.user.name,
                        email: session.user.email,
                        image: session.user.image,
                        username: username
                    }
                    : null
            }
        />
    );
}
