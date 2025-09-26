import { create } from 'zustand'
import { getAiMessages } from '@/app/actions'
import { useConversationStore } from './conversation-store'
import { useInputStore } from './input-store'
import { useUIStore } from './ui-store'
import { AiConversation, AiMessage } from '@prisma/client'
import { ApiRes } from '@/lib/utils'

// 组合所有 stores 的接口
interface AiStore {
  // 对话相关
  conversationList: AiConversation[]
  conversationListLoading: boolean
  curConversationId: string
  aiFirstMsg: string
  setConversationList: (conversationList: AiConversation[]) => void
  updateConversationList: (updater: (list: AiConversation[]) => AiConversation[]) => void
  setCurConversationId: (curConversationId: string) => void
  setAiFirstMsg: (aiFirstMsg: string) => void
  fetchConversationList: () => Promise<void>

  // 消息相关（保留便捷方法）
  fetchMessages: (conversationId: string) => Promise<ApiRes<AiMessage[]>>

  // 重置所有共享数据
  resetAiSharedData: () => void
}

// 创建组合 store，代理到各个专门的 stores
export const useAiStore = create<AiStore>(() => ({
  // 对话相关 - 代理到 conversationStore
  get conversationList() {
    return useConversationStore.getState().conversationList
  },
  get conversationListLoading() {
    return useConversationStore.getState().conversationListLoading
  },
  get curConversationId() {
    return useConversationStore.getState().curConversationId
  },
  get aiFirstMsg() {
    return useConversationStore.getState().aiFirstMsg
  },
  setConversationList: (conversationList) => {
    useConversationStore.getState().setConversationList(conversationList)
  },
  updateConversationList: (updater) => {
    useConversationStore.getState().updateConversationList(updater)
  },
  setCurConversationId: (curConversationId) => {
    useConversationStore.getState().setCurConversationId(curConversationId)
  },
  setAiFirstMsg: (aiFirstMsg) => {
    useConversationStore.getState().setAiFirstMsg(aiFirstMsg)
  },
  fetchConversationList: async () => {
    await useConversationStore.getState().fetchConversationList()
  },

  // 消息相关
  fetchMessages: async (conversationId: string) => {
    useUIStore.getState().setMessagesLoading(true)

    try {
      const res = await getAiMessages(conversationId)
      useUIStore.getState().setMessagesLoading(false)
      return res
    } catch (error) {
      useUIStore.getState().setMessagesLoading(false)
      console.error('获取消息失败:', error)
      throw error
    }
  },

  resetAiSharedData: () => {
    useConversationStore.getState().resetConversationState()
    useInputStore.getState().resetInputState()
    useUIStore.getState().resetUIState()
  }
}))
