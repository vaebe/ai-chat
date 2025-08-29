'use server'
import {
  getAiConversationList,
  generateAiConversationTitle,
  createAiConversation,
  removeAiConversation,
  updateAiConversation
} from '@/lib/ai-conversation'
import { getAiMessages, createAiMessage } from '@/lib/ai-message'
import { prisma } from '@/prisma'
import { createAiModel, getAiModels, updateAiModel, removeAiModel } from '@/lib/ai-model'

// AiModel server actions（返回 ApiRes，与 lib/ai-message.ts 风格一致）
export { createAiModel, getAiModels, updateAiModel, removeAiModel }

export async function saListModels(provider?: string) {
  const where: any = { deletedAt: null }
  if (provider) where.provider = provider
  const list = await prisma.aiModel.findMany({
    where,
    orderBy: [{ recommended: 'desc' }, { provider: 'asc' }, { displayName: 'asc' }]
  })
  return list
}

export async function saCreateModel(payload: {
  provider: string
  model: string
  displayName: string
  type: string
  capabilities: any
  recommended?: boolean
}) {
  const { provider, model, displayName, type, capabilities, recommended } = payload
  const data = await prisma.aiModel.create({
    data: {
      provider,
      model,
      displayName,
      type,
      capabilities: typeof capabilities === 'string' ? capabilities : JSON.stringify(capabilities),
      recommended: !!recommended
    }
  })
  return data
}

export async function saUpdateModel(payload: {
  id: string
  provider?: string
  model?: string
  displayName?: string
  type?: string
  capabilities?: any
  recommended?: boolean
}) {
  const { id, ...rest } = payload
  const data = await prisma.aiModel.update({
    where: { id },
    data: {
      ...(rest.provider ? { provider: rest.provider } : {}),
      ...(rest.model ? { model: rest.model } : {}),
      ...(rest.displayName ? { displayName: rest.displayName } : {}),
      ...(rest.type ? { type: rest.type } : {}),
      ...(typeof rest.recommended === 'boolean' ? { recommended: rest.recommended } : {}),
      ...(rest.capabilities
        ? {
            capabilities:
              typeof rest.capabilities === 'string'
                ? rest.capabilities
                : JSON.stringify(rest.capabilities)
          }
        : {})
    }
  })
  return data
}

export async function saDeleteModel(id: string) {
  await prisma.aiModel.update({ where: { id }, data: { deletedAt: new Date() } })
  return true
}

export {
  getAiConversationList,
  getAiMessages,
  createAiMessage,
  generateAiConversationTitle,
  createAiConversation,
  removeAiConversation,
  updateAiConversation
}
