import { sendJson } from '@/lib/utils'
import { auth } from '@/auth'
import { prisma } from '@/prisma'
import { z } from 'zod'

// 定义请求体的 schema
const conversationSchema = z.object({
  name: z.string().min(1, { message: '对话名称不能为空' }),
  uid: z.string().min(1, { message: 'uid不能为空' })
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return sendJson({ code: 401, msg: '请登录后重试！' })
  }

  try {
    const body = await req.json()

    // 对请求体进行验证
    const parsed = conversationSchema.safeParse(body)

    if (!parsed.success) {
      // 当解析失败时，返回第一个错误信息
      const errorMessage = parsed.error.issues[0].message
      return sendJson({ code: 400, msg: errorMessage })
    }

    // 解构验证后的数据
    const { name, uid } = parsed.data

    const info = await prisma.aIConversation.create({
      data: {
        id: uid, // 这里直接使用客户端传递的 uid 需要考虑如何防止用户修改
        name,
        userId: session.user.id
      }
    })
    return sendJson({ data: info })
  } catch (error) {
    return sendJson({ code: -1, msg: `创建对话失败 ${error}` })
  }
}
