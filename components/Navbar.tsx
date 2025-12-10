import { auth } from "@/auth";
import NavbarClient from "./NavbarClient";
import UserNavbar from "./UserNavbar";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";

export default async function Navbar({ dict }: { dict: any }) {
  const session = await auth();
  let username = null;

  if (session?.user?.email) {
    const USER_QUERY = defineQuery(`*[_type == "user" && email == $email][0].username`);
    username = await client.fetch(USER_QUERY, { email: session.user.email });
  }

  // Kirim data user (atau null) ke client
  return (
    <UserNavbar
      dict={dict}
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
