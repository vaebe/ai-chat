import { CoreMessage, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { auth } from '@/auth'
import { prisma } from '@/prisma'
import { generateUUID } from '@/lib/utils'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import { NextRequest } from 'next/server'
import { timeTool, webReaderTool } from './tools'
import { createGithubSearchMcpServer } from './mcp'
import { getClientIp } from '@/lib/utils'

// 允许最多 30 秒的流式响应 (免费版最大支持 60s)
export const maxDuration = 60

interface SaveMsgProps {
  aiMsg: string
  userMsg: string
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  userId: string
  conversationId: string
}

async function saveMsg(opts: SaveMsgProps) {
  const { aiMsg, userMsg, usage, userId, conversationId } = opts

  const list = [
    { role: 'user', content: userMsg, token: usage.completionTokens },
    { role: 'assistant', content: aiMsg, token: usage.promptTokens }
  ]

  const messages = list.map((msg) => ({
    id: generateUUID(false),
    conversationId,
    userId,
    ...msg
  }))

  try {
    await Promise.all(messages.map((item) => prisma.aIMessage.create({ data: item })))
  } catch (error) {
    console.error(`保存 AI 对话信息失败:`, error)
  }
}

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.fixedWindow(5, '30s'),
  analytics: true, // 启用的分析功能
  prefix: 'ai_chat'
})

export async function POST(req: NextRequest) {
  const { success } = await ratelimit.limit(getClientIp(req))

  if (!success) {
    return new Response('Ratelimited!', { status: 429 })
  }

  // 未登录返回 null
  const session = await auth()

  const userId = session?.user?.id ?? ''

  interface ReqProps {
    messages: CoreMessage[]
    data: Record<string, string | number>
  }

  const { messages, data }: ReqProps = await req.json()

  // conversationId 对话id
  const conversationId = data?.conversationId

  // 创建AI的客户端实例
  const openai = createOpenAI({
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', // AI的API基础URL
    compatibility: 'strict', // 设置兼容模式为严格模式
    apiKey: process.env.OPEN_API_KEY // 从环境变量获取API密钥-目前是阿里云
  })

  const githubSearchMcp = await createGithubSearchMcpServer()

  const result = streamText({
    model: openai('qwen-turbo-latest'), // 模型名称
    system: '你是一个通用的智能 AI 可以根据用户的输入回答问题', // 设置AI助手的系统角色提示
    messages, // 传入用户消息历史
    tools: {
      ...githubSearchMcp.tools,
      timeTool,
      webReaderTool
    },
    maxSteps: 5,
    onFinish({ text, usage }) {
      if (userId && conversationId) {
        saveMsg({
          aiMsg: text,
          userMsg: messages[messages.length - 1].content as string,
          usage: usage,
          userId,
          conversationId: `${conversationId}`
        })
      }

      githubSearchMcp.client.close()
    }
  })

  // 即使客户端已经断开连接，onFinish 也会触发
  result.consumeStream()

  // 将结果转换为数据流响应并返回
  return result.toDataStreamResponse({ sendReasoning: true, sendSources: true })
}
