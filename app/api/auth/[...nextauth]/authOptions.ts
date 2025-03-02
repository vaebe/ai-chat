import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/prisma/index'
import { AnyObject } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const AUTH_GITHUB_CLIENT_ID = process.env.AUTH_GITHUB_CLIENT_ID
const AUTH_GITHUB_CLIENT_SECRET = process.env.AUTH_GITHUB_CLIENT_SECRET

// 更新用户头像
async function updateUserProfilePicture(user?: AnyObject) {
  if (!user) {
    return
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        image: user.image
      }
    })
  } catch (error) {
    console.error(error)
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: AUTH_GITHUB_CLIENT_ID ?? '',
      clientSecret: AUTH_GITHUB_CLIENT_SECRET ?? '',
      httpOptions: {
        timeout: 10000 // 将超时时间设置为10秒（10000毫秒）
      }
    })
  ],
  pages: {
    signIn: '/',
    verifyRequest: '/auth/verify-request'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 过期时间,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, user }) {
      // todo 邮箱登录没有头像则设置一个默认头像
      if (account?.type === 'email' && !user?.image) {
        user.image = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${uuidv4().replaceAll('-', '')}&size=64`
        updateUserProfilePicture(user)
      }
      return true
    },
    async redirect({ baseUrl }) {
      return baseUrl
    },
    async jwt({ token, user }) {
      // 如果 user 存在，存储角色信息
      if (user) {
        token.role = user.role // 将角色存储到 token 中
        token.id = user.id // 将用户 id 存储到 token 中
      }
      return token
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role as string
      }

      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
