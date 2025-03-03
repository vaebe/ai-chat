import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/prisma/index'
import 'next-auth/jwt'

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: 'jwt' },
  // basePath: "/auth",
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (pathname === '/middleware-example') return !!auth
      return true
    },
    jwt({ token, trigger, session, account }) {
      if (trigger === 'update') token.name = session.user.name
      if (account?.provider === 'keycloak') {
        return { ...token, accessToken: account.access_token }
      }
      return token
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken

      return session
    }
  },
  experimental: { enableWebAuthn: true }
})

declare module 'next-auth' {
  interface Session {
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
  }
}
