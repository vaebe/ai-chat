import { UIMessage } from 'ai'
import { prisma } from '@/prisma'
import { ApiRes } from '@/lib/utils'
import { auth } from '@/auth'
import { AIMessage } from '@prisma/client'

interface CreateAiMessageProps {
  message: UIMessage
  userId: string
  chatId: string
}

// 创建 ai 消息
export async function createAiMessage(opts: CreateAiMessageProps): Promise<ApiRes> {
  const session = await auth()
  if (!session?.user?.id) {
    return { code: 401, msg: `无权限!` }
  }

  const { message, userId, chatId } = opts

  if (!userId || !chatId) {
    console.warn(`userId-${userId} chatId-${chatId} 不存在无法持久话聊天数据`)
    return { code: 400, msg: `参数不正确!` }
  }

  const { id, role, metadata, parts } = message

  try {
    await prisma.aIMessage.create({
      data: {
        userId,
        id,
        conversationId: chatId,
        role,
        metadata: JSON.stringify(metadata),
        parts: JSON.stringify(parts)
      }
    })

    return { code: 0, msg: `保存 AI 对话信息成功` }
  } catch (error) {
    console.error(`保存 AI 对话信息失败:`, error)
    return { code: -1, msg: `保存 AI 对话信息失败: ${error}` }
  }
}

// 获取 AI 消息详情
export async function getAiMessages(id: string): Promise<ApiRes<AIMessage[]>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { code: 401, msg: `无权限!` }
  }

  if (!id) {
    return { code: 400, msg: `参数不正确!` }
  }

  try {
    const list = await prisma.aIMessage.findMany({
      where: {
        conversationId: id,
        userId: session.user.id
      },
      orderBy: { createdAt: 'asc' }
    })

    return { code: 0, msg: `获取AI消息详情成功`, data: list }
  } catch (error) {
    return { code: -1, msg: `获取AI消息详情失败: ${error}` }
  }
}
