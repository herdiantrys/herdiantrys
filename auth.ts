import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getRandomDefaultProfilePicture } from "@/lib/default-profile-picture"
import { Prisma, Role, UserStatus } from "@prisma/client"

const getLanguagePreference = (preferences: Prisma.JsonValue | null | undefined) => {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    return "en"
  }

  const language = (preferences as Prisma.JsonObject).language
  return typeof language === "string" ? language : "en"
}

const isRole = (value: unknown): value is Role =>
  Object.values(Role).includes(value as Role)

const isUserStatus = (value: unknown): value is UserStatus =>
  Object.values(UserStatus).includes(value as UserStatus)

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
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
          status: user.status,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const { email, name, image } = user;
        if (!email) return false;

        try {
          // Check if user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });

          if (!existingUser) {
            // Check if this is the first user
            const userCount = await prisma.user.count();
            const role = userCount === 0 ? Role.SUPER_ADMIN : Role.USER;
            const profileImage = image || getRandomDefaultProfilePicture();

            // Only create if user doesn't exist
            await prisma.user.create({
              data: {
                email,
                name: name,
                username: `${email.split('@')[0]}_${Math.floor(Date.now() / 1000)}`, // Ensure unique
                image: profileImage,
                points: 0,
                role: role,
              }
            });
          } else {
            // Update existing user with latest data (Non-critical)
            try {
              const nextImage = existingUser.image || image || getRandomDefaultProfilePicture();

              await prisma.user.update({
                where: { email },
                data: {
                  name: name,
                  ...(existingUser.image ? {} : { image: nextImage })
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
        session.user.role = isRole(token.role) ? token.role : Role.USER;
        session.user.status = isUserStatus(token.status) ? token.status : UserStatus.ACTIVE;
        session.user.language = typeof token.language === "string" ? token.language : "en";
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
          token.status = dbUser.status; // Include status for social logins
          token.language = getLanguagePreference(dbUser.preferences);
        }
      } else if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.status = user.status; // Include status for credentials login
        // Search user to get preferences since credentials login only returns basic fields via authorize
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (dbUser) {
          token.language = getLanguagePreference(dbUser.preferences);
        }
      }
      return token;
    }
  }
})
