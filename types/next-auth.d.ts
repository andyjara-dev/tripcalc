import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    isPremium?: boolean
    isAdmin?: boolean
    createdAt: Date
  }

  interface Session {
    user: {
      id: string
      isPremium: boolean
      isAdmin: boolean
      createdAt: Date
    } & DefaultSession["user"]
  }
}
