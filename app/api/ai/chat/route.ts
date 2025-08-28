import { convertToModelMessages, createIdGenerator, streamText, UIMessage, smoothStream } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import { NextRequest } from 'next/server'
import { getClientIp } from '@/lib/utils'
import { createAiMessage, getAiMessages, removeAiMessage } from '@/lib/ai-message'
import { createDuckDuckGoMcpServer, createGithubSearchMcpServer } from './mcp'

// 允许最多 n 秒的流式响应
export const maxDuration = 300

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.fixedWindow(5, '30s'),
  analytics: true, // 启用的分析功能
  prefix: 'ai_chat'
})

interface ReqProps {
  message: UIMessage
  id: string
  trigger: 'submit-message' | 'regenerate-message'
  lastAiMsgId: string
}

export async function POST(req: NextRequest) {
  const { success } = await ratelimit.limit(getClientIp(req))

  if (!success) {
    return new Response('Ratelimited!', { status: 429 })
  }

  // 未登录返回 null
  const { userId } = await auth()
  if (!userId) {
    return new Response('无权限!', { status: 401 })
  }

  const { message, id: chatId, trigger, lastAiMsgId }: ReqProps = await req.json()

  if (trigger === 'regenerate-message') {
    removeAiMessage(lastAiMsgId)
  }

  // 保存用户发送的消息
  createAiMessage({ message, chatId })

  const oldMessagesRes = await getAiMessages(chatId)
  if (oldMessagesRes.code !== 0) {
    return new Response(oldMessagesRes.msg, { status: 500 })
  }

  const oldMessages =
    oldMessagesRes.data?.map((item) => {
      return {
        id: item.id,
        role: item.role,
        metadata: JSON.parse(item.metadata ?? '{}'),
        parts: JSON.parse(item.parts)
      } as UIMessage
    }) ?? []

  // const duckDuckGoMcp = await createDuckDuckGoMcpServer()
  const githubSearchMcp = await createGithubSearchMcpServer()

  const aiModelName = 'openai/gpt-4.1-nano'
  const result = streamText({
    model: aiModelName,
    system:
      '你是一个通用的智能 AI 可以根据用户的输入回答问题，在没有被用户要求时使用中文回答问题。', // 设置AI助手的系统角色提示
    messages: convertToModelMessages([...oldMessages, message]), // 传入用户消息历史
    experimental_transform: smoothStream({
      // 平滑文本流 https://ai-sdk.dev/docs/reference/ai-sdk-core/smooth-stream#word-chunking-caveats-with-non-latin-languages
      chunking: /[\u4E00-\u9FFF]|\S+\s+/
    }),
    tools: {
      ...githubSearchMcp.tools
      // ...duckDuckGoMcp.tools
    },
    toolChoice: 'auto', // 自动选择工具
    onFinish: () => {
      githubSearchMcp.client.close()
      // duckDuckGoMcp.client.close()
    }
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
      if (part.type === 'start') {
        return {
          createdAt: Date.now(),
          model: aiModelName
        }
      }

      if (part.type === 'finish') {
        return {
          totalTokens: part.totalUsage.totalTokens
        }
      }
    },
    onFinish: ({ messages }) => {
      createAiMessage({ message: messages[0], chatId })
    }
  })
}
