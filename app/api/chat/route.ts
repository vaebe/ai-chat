import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  UIMessage,
  smoothStream,
  stepCountIs,
  wrapLanguageModel,
  extractReasoningMiddleware
} from 'ai'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { createAiMessage, getAiMessages } from '@/lib/ai-message'
import { createTools } from './tools/tool-manager'
import { createSystemPrompt } from './utils'
import { gateway } from '@ai-sdk/gateway'
import { z } from 'zod'
import { ChatRequestSchema } from './utils'

// 允许最多 n 秒的流式响应
export const maxDuration = 300

// 获取历史消息
async function getChatHistory(id: string) {
  const { code, data, msg } = await getAiMessages(id)
  if (code !== 0) {
    return { code, data: [], msg }
  }

  const datas = Array.isArray(data) ? data : []

  const list = datas.map((item) => {
    return {
      id: item.id,
      role: item.role,
      metadata: JSON.parse(item.metadata ?? '{}'),
      parts: JSON.parse(item.parts)
    } as UIMessage
  })

  return { code, data: list, msg }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return new Response('无权限!', { status: 401 })
  }

  let toolManager: Awaited<ReturnType<typeof createTools>> | null = null

  try {
    // 解析并验证请求体
    const body = await req.json()
    const validatedData = ChatRequestSchema.parse(body)

    const { message, id: chatId, userTools, timestamp, date, model: modelName } = validatedData

    // 保存用户发送的消息
    createAiMessage({ message, chatId })

    const chatHistoryRes = await getChatHistory(chatId)

    if (chatHistoryRes.code !== 0) {
      return new Response(chatHistoryRes.msg, { status: 500 })
    }

    // 根据用户控制的工具配置初始化工具管理器
    toolManager = await createTools(userTools)

    const systemPrompt = createSystemPrompt({
      toolsDescription: toolManager.getDesc(),
      enabledTools: toolManager.getNames(),
      timestamp,
      date
    })

    // 使用 extractReasoningMiddleware 提取 <think> 和 </think>
    const model = wrapLanguageModel({
      model: gateway(modelName),
      middleware: extractReasoningMiddleware({ tagName: 'think' })
    })

    const messages = await convertToModelMessages([...chatHistoryRes.data, message])

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      experimental_transform: smoothStream(),
      tools: toolManager.getAllTools(),
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
        // 压缩消息-这里可以使用 ai 总结
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

        if (toolManager) {
          await toolManager.close()
        }
      }
    })

    // 即使客户端断开连接也会触发清理
    result.consumeStream({
      onError: (error) => {
        console.error('Stream consumption error:', error)
        if (toolManager) {
          toolManager.close()
        }
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
            availableTools: toolManager?.getNames() || []
          }
        }

        if (part.type === 'finish') {
          return { ...part, endAt: Date.now() }
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
    if (error instanceof z.ZodError) {
      console.error('请求参数验证失败:', error.issues)
      return new Response(`请求参数错误: ${JSON.stringify(error.issues)}`, { status: 400 })
    }

    console.error('Chat processing error:', error)
    if (toolManager) {
      await toolManager.close()
    }
    return new Response('处理请求时发生错误', { status: 500 })
  }
}
