import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { client } from "@/sanity/lib/client"
import { writeClient } from "@/sanity/lib/write-client"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        // Mengambil user dari Sanity
        const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id,
          name: user.fullName,
          email: user.email,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const { email, name, image } = user;

        try {
          // Check if user with this email already exists
          const existingUser = await client.fetch(`*[_type == "user" && email == $email][0]`, { email });

          if (!existingUser) {
            // Only create if user doesn't exist
            await writeClient.create({
              _type: 'user',
              email,
              fullName: name,
              username: email?.split('@')[0], // Use part of email as initial username
              imageURL: image,
            });
          }

          return true;
        } catch (error) {
          console.error("Error syncing user to Sanity:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if ((account?.provider === 'google' || account?.provider === 'github') && user?.email) {
        // Always fetch the Sanity user ID by email to ensure we get the correct existing ID
        const sanityUser = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: user.email });
        if (sanityUser) {
          token.sub = sanityUser._id;
        }
      } else if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
})