import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./db"

// Build providers array dynamically based on available credentials
const providers = []

// Email provider (optional)
if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    })
  )
}

// Google OAuth (optional)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// GitHub OAuth (optional)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-expect-error - Type incompatibility between next-auth beta and @auth/prisma-adapter versions
  adapter: PrismaAdapter(prisma),
  providers,
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // @ts-ignore - Add custom fields to session
        session.user.isPremium = user.isPremium || false
        // @ts-ignore - Add custom fields to session
        session.user.isAdmin = user.isAdmin || false
        // @ts-ignore - Add createdAt to session
        session.user.createdAt = user.createdAt
      }
      return session
    },
  },
})
