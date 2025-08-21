import { convertToModelMessages, createIdGenerator, streamText, UIMessage } from 'ai'
import { auth } from '@/auth'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import { NextRequest } from 'next/server'
import { getClientIp } from '@/lib/utils'
import { createAiMessage } from '@/lib/ai-message'

// 允许最多 60 秒的流式响应 (免费版最大支持 60s)
export const maxDuration = 60

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
    messages: UIMessage[]
    id: string
    trigger: string
  }

  const { messages, id: chatId }: ReqProps = await req.json()

  const result = streamText({
    model: 'openai/gpt-4.1-nano', // 模型名称
    temperature: 0.6,
    system: '你是一个通用的智能 AI 可以根据用户的输入回答问题', // 设置AI助手的系统角色提示
    messages: convertToModelMessages(messages) // 传入用户消息历史
  })

  // 即使客户端已经断开连接，onFinish 也会触发
  result.consumeStream()

  // 将结果转换为数据流响应并返回
  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: true,
    generateMessageId: createIdGenerator({
      prefix: 'msg',
      size: 16
    }),
    messageMetadata: ({ part }) => {
      if (part.type === 'finish') {
        return {
          totalTokens: part.totalUsage.totalTokens
        }
      }
    },
    onFinish: ({ messages }) => {
      createAiMessage({ message: messages[0], userId, chatId })
    }
  })
}
