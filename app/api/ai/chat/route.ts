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
import { createAiMessage, getAiMessages } from '@/lib/ai-message'
import { ToolManager } from './tools/tool-manager'
import { deepSeekProvider } from './providers/deepseek'
import { createSystemPrompt } from './utils'

// 允许最多 n 秒的流式响应
export const maxDuration = 300

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.fixedWindow(5, '30s'),
  analytics: true,
  prefix: 'ai_chat'
})

interface ReqProps {
  message: UIMessage
  id: string
  // 仅包含用户控制的工具
  userTools?: {
    enableWebSearch?: boolean
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

  const { message, id: chatId, userTools }: ReqProps = await req.json()

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
      experimental_transform: smoothStream({ chunking: /[\u4E00-\u9FFF]|\S+\s+/ }),
      tools: allTools,
      toolChoice: 'auto',
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
      generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
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
