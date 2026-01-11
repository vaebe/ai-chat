import { getAiMessages } from '@/lib/ai-message'
import { UIMessage } from 'ai'
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
