import { prisma } from '@/prisma'
import { decrypt } from '@/lib/crypto'
import { auth } from '@clerk/nextjs/server'
import { createOpenAI } from '@ai-sdk/openai'

export interface UserProviderModel {
  label: string
  modelInput: string | ReturnType<ReturnType<typeof createOpenAI>>
}

export async function getUserDefaultProviderModel(): Promise<UserProviderModel | null> {
  const { userId } = await auth()
  if (!userId) return null

  const config = await prisma.aiProviderConfig.findFirst({
    where: { userId, deletedAt: null, isDefault: true },
    orderBy: { updatedAt: 'desc' }
  })

  if (!config) return null

  // 目前支持 OpenAI 兼容协议（包含 DeepSeek/OpenRouter 等）
  // 通过自定义 baseURL + apiKey 即可
  if (
    config.provider === 'openai' ||
    config.provider === 'openai-compatible' ||
    config.provider === 'deepseek'
  ) {
    const apiKey = decrypt(config.apiKeyEnc)
    const openai = createOpenAI({
      apiKey,
      ...(config.baseURL ? { baseURL: config.baseURL } : {})
    })
    return {
      label: `${config.provider}:${config.model}`,
      modelInput: openai(config.model)
    }
  }

  // 未识别的 provider，回退为字符串模型，让上层决定如何处理
  return {
    label: `${config.provider}:${config.model}`,
    modelInput: `${config.provider}/${config.model}`
  }
}
