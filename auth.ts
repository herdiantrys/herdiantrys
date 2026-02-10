import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
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
        // Mengambil user dari Prisma
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role, // Fix lint error
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const { email, name, image } = user;
        if (!email) return false;

        try {
          // Check if user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });

          if (!existingUser) {
            // Only create if user doesn't exist
            await prisma.user.create({
              data: {
                email,
                name: name,
                username: `${email.split('@')[0]}_${Math.floor(Date.now() / 1000)}`, // Ensure unique
                // imageURL: image, // Disabled to prevent client mismatch
                image: image,    // Map to profileImage
                points: 0,
                role: 'USER',
              }
            });
          } else {
            // Update existing user with latest data (Non-critical)
            try {
              await prisma.user.update({
                where: { email },
                data: {
                  name: name,
                  image: image
                }
              });
            } catch (e) {
              console.warn("Profile sync skipped:", e);
            }
          }

          return true;
        } catch (error) {
          console.error("Error syncing user to Prisma:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as any;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if ((account?.provider === 'google' || account?.provider === 'github') && user?.email) {
        // Always fetch the Prisma user ID by email to ensure we get the correct existing ID
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
        }
      } else if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    }
  }
})