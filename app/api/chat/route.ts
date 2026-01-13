import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  smoothStream,
  stepCountIs,
  wrapLanguageModel,
  extractReasoningMiddleware,
  consumeStream
} from 'ai'
import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { ChatRequestSchema } from './utils'
import { createAiMessage } from '@/lib/ai-message'
import { createTools } from './tools/tool-manager'
import { loadChatHistory, createCustomAIMessagesResponse } from './utils'
import { gateway } from '@ai-sdk/gateway'
import { createSystemPrompt } from './prompts'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return createCustomAIMessagesResponse('无权限!')
  }

  let toolManager: Awaited<ReturnType<typeof createTools>> | null = null

  try {
    const body = await req.json()
    const validatedData = ChatRequestSchema.parse(body)
    const { message, id: chatId, userTools, timestamp, date, model: modelName } = validatedData

    const chatHistoryRes = await loadChatHistory(chatId)
    if (chatHistoryRes.code !== 0) {
      return createCustomAIMessagesResponse(chatHistoryRes.msg || '加载聊天历史失败')
    }

    createAiMessage({ message, chatId })

    const model = wrapLanguageModel({
      model: gateway(modelName),
      middleware: extractReasoningMiddleware({ tagName: 'think' })
    })

    toolManager = await createTools(userTools)

    const systemPrompt = createSystemPrompt({
      toolsDescription: toolManager.getDesc(),
      enabledTools: toolManager.getNames(),
      timestamp,
      date
    })

    const messages = await convertToModelMessages([...chatHistoryRes.data, message])

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      experimental_transform: smoothStream(),
      tools: toolManager.getAllTools(),
      toolChoice: 'auto',
      stopWhen: stepCountIs(10),
      onStepFinish: (step) => {
        console.log('Step finished:', {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          textLength: step.text?.length || 0,
          finishReason: step.finishReason,
          usage: step.usage
        })
      },
      prepareStep: ({ messages }) => {
        if (messages.length > 10) {
          return {
            messages: [messages[0], ...messages.slice(-5)]
          }
        }
        return {}
      },
      onFinish: async (finishResult) => {
        const { finishReason, usage, steps } = finishResult
        console.log('Stream finished:', { finishReason, usage, steps: steps?.length || 1 })
      }
    })

    // 返回响应
    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
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
      onFinish: (result) => {
        if (result?.responseMessage) {
          createAiMessage({ message: result.responseMessage, chatId })
        }
        toolManager?.close()
      },
      onError: (error) => {
        console.error('Stream error:', error)
        toolManager?.close()
        return 'Stream error occurred'
      }
    })
  } catch (error) {
    toolManager?.close()
    if (error instanceof ZodError) {
      console.error('请求参数验证失败:', error.issues)
      return createCustomAIMessagesResponse(`请求参数错误: ${JSON.stringify(error.issues)}`)
    }
    console.error('Chat processing error:', error)
    const errorMessage = error instanceof Error ? error.message : '处理请求时发生错误'
    return createCustomAIMessagesResponse(errorMessage)
  }
}
