import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  UIMessage,
  smoothStream,
  stepCountIs
} from 'ai'
import { auth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import { NextRequest } from 'next/server'
import { getClientIp } from '@/lib/utils'
import { createAiMessage, getAiMessages, removeAiMessage } from '@/lib/ai-message'
import { ToolManager } from './tools/tool-manager'
import { deepSeekProvider } from './providers/deepseek'

// 允许最多 n 秒的流式响应
export const maxDuration = 300

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.fixedWindow(5, '30s'),
  analytics: true,
  prefix: 'ai_chat'
})

const createSystemPrompt = (toolsDescription: string, enabledTools: string[]) => `
你是一个智能助手，拥有多种工具来帮助用户解决问题。

${toolsDescription}

## 工具使用策略：

### AI 自主工具（你可以自由决定何时使用）：
- **GitHub 搜索**：当需要代码示例、开源项目信息或技术文档时主动使用
- 根据问题的技术性质和复杂度，智能判断是否需要搜索相关代码或项目

### 用户控制工具（仅在用户明确需要时使用）：
${enabledTools.includes('web_search') ? '- **网络搜索**：用户已启用，可用于搜索最新信息、新闻、资料等' : ''}
${enabledTools.includes('filesystem_read_file') ? '- **文件系统**：用户已启用，可用于文件操作（请谨慎使用）' : ''}

## 行为准则：
1. **智能工具选择**：
   - 对于编程、技术问题，主动使用 GitHub 搜索查找相关代码和项目
   - 对于需要最新信息的问题，如果用户启用了网络搜索，可以使用
   - 明确告知用户正在使用哪些工具以及为什么使用

2. **Markdown 格式**：严格使用 Markdown 格式输出，包括：
   - 代码块使用正确的语法高亮 (\`\`\`ts、\`\`\`bash 等)
   - 支持表格、任务列表、数学公式

3. **信息来源标注**：使用工具获取信息时，明确标注信息来源和获取时间

4. **用户引导**：如果问题需要某个未启用的用户控制工具，可以建议用户启用该工具

请根据问题类型和用户需求，合理使用可用工具提供准确、有用的回答。`

interface ReqProps {
  message: UIMessage
  id: string
  trigger: 'submit-message' | 'regenerate-message'
  lastAiMsgId: string
  // 仅包含用户控制的工具
  userTools?: {
    enableWebSearch?: boolean
    enableFilesystem?: boolean
  }
}

export async function POST(req: NextRequest) {
  const { success } = await ratelimit.limit(getClientIp(req))

  if (!success) {
    return new Response('Ratelimited!', { status: 429 })
  }

  const { userId } = await auth()
  if (!userId) {
    return new Response('无权限!', { status: 401 })
  }

  const { message, id: chatId, trigger, lastAiMsgId, userTools }: ReqProps = await req.json()

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

  // 根据用户控制的工具配置初始化工具管理器
  const toolManager = await new ToolManager().initialize(userTools)
  const allTools = toolManager.getAllTools()
  const toolsDescription = toolManager.getToolsDescription()
  const enabledToolNames = toolManager.getEnabledToolNames()

  console.log('Available tools:', enabledToolNames)

  // const aiModelName = 'deepseek/deepseek-v3.1'
  const aiModelName = 'deepseek-chat'

  try {
    const result = streamText({
      model: deepSeekProvider(aiModelName),
      system: createSystemPrompt(toolsDescription, enabledToolNames),
      messages: convertToModelMessages([...oldMessages, message]),
      experimental_transform: smoothStream({
        chunking: /[\u4E00-\u9FFF]|\S+\s+/
      }),
      tools: allTools,
      toolChoice: 'auto',
      // 使用 AI SDK v5 的多步骤工具调用
      stopWhen: stepCountIs(10), // 最多 10 步
      // 每步完成后的回调
      onStepFinish: (step) => {
        console.log('Step finished:', {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          textLength: step.text ? step.text.length : 0,
          finishReason: step.finishReason,
          usage: step.usage
        })
      },
      // 准备下一步的回调
      prepareStep: ({ stepNumber, steps }) => {
        // 对于长对话，可以进行消息压缩
        if (stepNumber > 5) {
          console.log(
            `Long conversation detected at step ${stepNumber}, consider message compression`
          )
        }
        // 可以根据步骤数量动态调整参数
        return {
          // 例如：在后续步骤中降低温度以提高一致性
          // temperature: stepNumber > 3 ? 0.3 : 0.7
        }
      },
      // 流程完成时的回调
      onFinish: async (finishResult) => {
        console.log('Stream finished:', {
          finishReason: finishResult.finishReason,
          totalUsage: finishResult.usage,
          steps: finishResult.steps?.length || 1
        })
        await toolManager.closeAll()
      }
    })

    // 即使客户端断开连接也会触发清理
    result.consumeStream({
      onError: (error) => {
        console.error('Stream consumption error:', error)
        toolManager.closeAll()
      }
    })

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
            model: aiModelName,
            availableTools: enabledToolNames
          }
        }

        if (part.type === 'finish') {
          return {
            totalTokens: part.totalUsage.totalTokens,
            steps: 1 // 在v5中，steps信息在onFinish回调中获取
          }
        }
      },
      onFinish: ({ messages }) => {
        // 保存AI生成的消息
        if (messages && messages.length > 0) {
          createAiMessage({ message: messages[messages.length - 1], chatId })
        }
      }
    })
  } catch (error) {
    console.error('Chat processing error:', error)
    await toolManager.closeAll()
    return new Response('处理请求时发生错误', { status: 500 })
  }
}
