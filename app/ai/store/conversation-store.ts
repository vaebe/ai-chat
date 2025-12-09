import { create } from 'zustand'
import { getAiConversationList } from '@/app/actions'
import { ConversationState, ConversationActions } from '@/types/ai'
import type { AiConversation } from '@/generated/prisma/client'

const defaultState: ConversationState = {
  conversationList: [],
  conversationListLoading: false,
  curConversationId: '',
  aiFirstMsg: ''
}

export const useConversationStore = create<ConversationState & ConversationActions>((set) => ({
  ...defaultState,

  setConversationList: (conversationList: Array<AiConversation>) => set({ conversationList }),

  updateConversationList: (updater: (list: Array<AiConversation>) => Array<AiConversation>) =>
    set((state) => ({
      conversationList: updater(state.conversationList)
    })),

  setConversationListLoading: (conversationListLoading: boolean) =>
    set({ conversationListLoading }),

  setCurConversationId: (curConversationId: string) => set({ curConversationId }),

  setAiFirstMsg: (aiFirstMsg: string) => set({ aiFirstMsg }),

  fetchConversationList: async () => {
    set({ conversationListLoading: true })

    try {
      const res = await getAiConversationList()
      const list = res.code === 0 ? res.data?.list || [] : []

      set({
        conversationList: list,
        conversationListLoading: false
      })
    } catch (error) {
      set({
        conversationListLoading: false
      })
      console.error('获取对话列表失败:', error)
    }
  },

  resetConversationState: () => set(defaultState)
}))
