
import NextAuth, { DefaultSession } from "next-auth"
import { Role, UserStatus } from "@prisma/client"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: Role
            status: UserStatus
            language?: string
        } & DefaultSession["user"]
    }

    interface User {
        role: Role
        status: UserStatus
        language?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role
        status: UserStatus
        language?: string
    }
}
