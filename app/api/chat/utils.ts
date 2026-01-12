import { getAiMessages } from '@/lib/ai-message'
import { createTextStreamResponse, generateId, UIMessage } from 'ai'
import { z } from 'zod'

export const ChatRequestSchema = z.object({
  message: z.object({
    id: z.string().min(1),
    role: z.enum(['user', 'assistant', 'system']),
    parts: z.any().refine((val) => Array.isArray(val) && val.length > 0, {
      message: 'parts must be a non-empty array'
    }),
    metadata: z.any().optional()
  }),
  id: z.string().min(1),
  timestamp: z.number().int().positive(),
  date: z.string().min(1, 'date cannot be empty'),
  model: z.string().min(1),
  userTools: z
    .object({
      enableWebSearch: z.boolean().optional()
    })
    .optional()
})

interface CreateSystemPromptProps {
  toolsDescription: string
  enabledTools: string[]
  timestamp: number
  date: string
}

// 获取对话历史数据
export async function loadChatHistory(id: string) {
  const { code, data, msg } = await getAiMessages(id)

  if (code !== 0) {
    return { code, data: [], msg }
  }

  const datas = Array.isArray(data) ? data : []

  const list = datas.map((item) => ({
    id: item.id,
    role: item.role,
    metadata: JSON.parse(item.metadata ?? '{}'),
    parts: JSON.parse(item.parts)
  })) as UIMessage[]

  return { code, data: list, msg }
}

// 返回自定义 AI 消息
export function createCustomAIMessagesResponse(errorMessage: string) {
  const textStream = new ReadableStream<string>({
    start(controller) {
      const messageId = generateId()
      const textId = 'txt-0'

      // start
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'start',
          messageId
        })}\n\n`
      )

      controller.enqueue(`data: ${JSON.stringify({ type: 'start-step' })}\n\n`)

      // text start
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'text-start',
          id: textId
        })}\n\n`
      )

      // text delta（真正显示的内容）
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'text-delta',
          id: textId,
          delta: errorMessage
        })}\n\n`
      )

      // text end
      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'text-end',
          id: textId
        })}\n\n`
      )

      controller.enqueue(`data: ${JSON.stringify({ type: 'finish-step' })}\n\n`)

      controller.enqueue(
        `data: ${JSON.stringify({
          type: 'finish',
          finishReason: 'stop'
        })}\n\n`
      )

      controller.enqueue(`data: [DONE]\n\n`)
      controller.close()
    }
  })

  return createTextStreamResponse({
    textStream,
    headers: {
      'Content-Type': 'text/event-stream'
    }
  })
}
