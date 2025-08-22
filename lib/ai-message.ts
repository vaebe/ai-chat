import { UIMessage } from 'ai'
import { prisma } from '@/prisma'
import { ApiRes } from '@/lib/utils'
import { auth } from '@/auth'
import { AiMessage } from '@prisma/client'

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
    await prisma.aiMessage.upsert({
      where: { id: id }, // 查找条件
      update: {
        // 如果记录存在，更新这些字段
        role,
        metadata: JSON.stringify(metadata),
        parts: JSON.stringify(parts),
        userId, // 确保 userId 也更新（如果需要的话）
        conversationId: chatId,
        updatedAt: new Date() // 更新时间戳
      },
      create: {
        // 如果记录不存在，创建新记录
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
export async function getAiMessages(id: string): Promise<ApiRes<AiMessage[]>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { code: 401, msg: `无权限!` }
  }

  if (!id) {
    return { code: 400, msg: `参数不正确!` }
  }

  try {
    const list = await prisma.aiMessage.findMany({
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

export async function removeAiMessage(id: string): Promise<ApiRes<AiMessage>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { code: 401, msg: `无权限!` }
  }

  if (!id) {
    return { code: 400, msg: `参数不正确!` }
  }

  try {
    const deleted = await prisma.aiMessage.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    // 确保只能删除当前用户的消息
    if (deleted.userId !== session.user.id) {
      return { code: 403, msg: `无权删除该消息!` }
    }

    return { code: 0, msg: `删除AI消息成功`, data: deleted }
  } catch (error) {
    return { code: -1, msg: `删除AI消息失败: ${error}` }
  }
}
