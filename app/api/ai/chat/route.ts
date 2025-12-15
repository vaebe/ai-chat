import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  UIMessage,
  smoothStream,
  stepCountIs
} from 'ai'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { createAiMessage, getAiMessages } from '@/lib/ai-message'
import { ToolManager } from './tools/tool-manager'
import { createSystemPrompt } from './utils'

// 允许最多 n 秒的流式响应
export const maxDuration = 300

interface ReqProps {
  message: UIMessage
  id: string
  timestamp: number
  date: string
  model: string
  // 仅包含用户控制的工具
  userTools?: {
    enableWebSearch?: boolean
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return new Response('无权限!', { status: 401 })
  }

  const {
    message,
    id: chatId,
    userTools,
    timestamp,
    date,
    model: modelName
  }: ReqProps = await req.json()

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

  const systemPrompt = createSystemPrompt({
    toolsDescription,
    enabledTools: enabledToolNames,
    timestamp,
    date
  })

  try {
    const result = streamText({
      model: modelName,
      system: systemPrompt,
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
      prepareStep: async ({ messages }) => {
        if (messages.length > 10) {
          return {
            messages: [
              messages[0], // Keep system message
              ...messages.slice(-5) // Keep last 10 messages
            ]
          }
        }
        return {}
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
            model: modelName,
            availableTools: enabledToolNames
          }
        }

        if (part.type === 'finish') {
          return {
            totalTokens: part.totalUsage.totalTokens
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
