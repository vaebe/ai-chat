import { ApiRes, PaginationResData } from '@/lib/utils'
import { auth } from '@/auth'
import { prisma } from '@/prisma'
import { AIConversation, AIMessage } from '@prisma/client'
import { ModelMessage, UIMessage, generateText } from 'ai'
import { z } from 'zod'

interface GetAiConversationListProps {
  page?: number
  pageSize?: number
}

// 获取用户的对话分组
export async function getAiConversationList(
  props?: GetAiConversationListProps
): Promise<PaginationResData<AIConversation>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { code: 401, msg: `无权限!` }
  }

  try {
    const { page = 1, pageSize = 10 } = props || {}

    const skip = (page - 1) * pageSize

    const list = await prisma.aIConversation.findMany({
      where: {
        userId: session!.user.id,
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: pageSize
    })

    const total = await prisma.aIConversation.count({
      where: {
        userId: session!.user.id
      }
    })

    return {
      code: 0,
      msg: '获取对话列表成功',
      data: {
        list,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error) {
    return { code: -1, msg: `获取对话列表失败: ${error}` }
  }
}

function generateAiConversationTitlePrompt(list: Array<AIMessage>) {
  const msg = list.map((item) => {
    const parts = JSON.parse(item.parts) as UIMessage['parts']
    const content = parts
      .filter((s) => s.type === 'text')
      .map((item) => item.text)
      .join(',')

    return {
      content,
      role: item.role as ModelMessage['role']
    }
  })

  return `
    根据以下一段对话内容，提取其核心信息，并生成一个标题和描述：
    对话内容："${JSON.stringify(msg)}"。
    非常重要
      - 无需使用 markdown 格式返回。
    要求：
      - 标题不超过18个字。
      - 描述不超过50字。
      - 保持语言简洁明了。
      - 输出结果格式为：{"name":"","desc":""}。
  `
}

// 生成 AI 对话标题
export async function generateAiConversationTitle(
  id: string
): Promise<ApiRes<{ name: string; desc: string }>> {
  const session = await auth()
  if (!session?.user) {
    return { code: 401, msg: `无权限!` }
  }

  if (!id) {
    return { code: 400, msg: '参数不正确!' }
  }

  try {
    // 查询开始对话的两条数据生成标题
    const conversationData = await prisma.aIMessage.findMany({
      where: { id },
      orderBy: { createdAt: 'asc' },
      skip: 0,
      take: 2
    })

    if (!conversationData.length) {
      console.warn(`对话信息不存在,无法生成标题!`)
      return { code: -1, msg: `对话信息不存在,无法生成标题!` }
    }

    const result = await generateText({
      model: 'openai/gpt-4.1-nano', // 模型名称
      prompt: generateAiConversationTitlePrompt(conversationData) // 设置AI助手的系统角色提示
    })

    const info = JSON.parse(result.text)

    // 将数据保存到数据库
    await prisma.aIConversation.update({
      where: { id },
      data: {
        name: info.name,
        desc: info.desc
      }
    })

    return { code: 0, msg: '生成对话名称成功', data: info }
  } catch (error) {
    console.error(`生成对话名称失败:${error}`)
    return { code: -1, msg: `生成对话名称失败: ${error}` }
  }
}

const CreateAiConversationSchema = z.object({
  name: z.string().min(1, { message: '对话名称不能为空' }),
  uid: z.string().min(1, { message: 'uid不能为空' })
})

// 创建 Ai 对话
export async function createAiConversation(
  props: z.infer<typeof CreateAiConversationSchema>
): Promise<ApiRes<AIConversation>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { code: 401, msg: '请登录后重试！' }
  }

  // 对请求体进行验证
  const parsed = CreateAiConversationSchema.safeParse(props)

  if (!parsed.success) {
    // 当解析失败时，返回第一个错误信息
    const errorMessage = parsed.error.issues[0].message
    return { code: 400, msg: errorMessage }
  }

  try {
    // 解构验证后的数据
    const { name, uid } = parsed.data

    const info = await prisma.aIConversation.create({
      data: {
        id: uid,
        name,
        userId: session.user.id
      }
    })
    return { code: 0, msg: '创建对话成功', data: info }
  } catch (error) {
    return { code: -1, msg: `创建对话失败 ${error}` }
  }
}

// 删除 Ai 对话
export async function removeAiConversation(id: string): Promise<ApiRes> {
  try {
    await prisma.aIConversation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        messages: {
          updateMany: {
            where: { conversationId: id },
            data: { deletedAt: new Date() }
          }
        }
      }
    })

    return { code: 0, msg: '删除对话成功' }
  } catch (error) {
    return { code: -1, msg: error instanceof Error ? error.message : '删除对话失败!' }
  }
}

const UpdateAiConversationSchema = z.object({
  name: z.string().min(1, { message: '对话名称不能为空' }),
  id: z.string().min(1, { message: 'id 不能为空' }),
  desc: z.string().optional()
})

// 更新 Ai 对话
export async function updateAiConversation(
  props: z.infer<typeof UpdateAiConversationSchema>
): Promise<ApiRes<AIConversation>> {
  try {
    const { id, name, desc } = UpdateAiConversationSchema.parse(props)

    const data = await prisma.aIConversation.update({
      where: { id },
      data: {
        name,
        ...(desc ? { desc } : {})
      }
    })

    return { code: 0, msg: '更新对话成功', data }
  } catch (error) {
    console.error(error)
    return { code: -1, msg: '更新对话失败!' }
  }
}
