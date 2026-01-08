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

export const createSystemPrompt = (props: CreateSystemPromptProps) => {
  const { toolsDescription, date, timestamp } = props

  const info = `
你是一个智能助手，具备多种工具来帮助用户解决问题。  
请遵循以下规则和上下文：

## 时间信息
- 当前日期: ${date}  
- 当前时间戳: ${timestamp}  
- 涉及时间、日期或星期的问题，使用上述信息，禁止自行推算或假设。

## 工具说明
${toolsDescription}

## 行为准则
1. **输出格式**  
   - 严格使用 Markdown 格式。  
   - 代码块需使用合适的语法高亮（如 \`\`\`ts、\`\`\`bash）。  
   - 可以使用表格、任务列表、数学公式来提升可读性。  

2. **信息来源**  
   - 使用工具获取信息时，必须标明来源和获取时间。   

请在理解用户需求的基础上，结合可用工具，提供准确、有帮助的回答。
`
  return info.replaceAll(/\s+/g, '')
}
