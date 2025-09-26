import { create } from 'zustand'
import { AiConversation } from '@prisma/client'

// 定义数据类型
export interface AiSharedData {
  layoutSidebar: boolean // 对话侧边栏展开状态
  curConversationId: string // 当前对话 id
  aiFirstMsg: string // 首次发送给 ai 的文本
  conversationList: Array<AiConversation>
}

// 定义 Store 类型
interface AiStore {
  aiSharedData: AiSharedData
  setLayoutSidebar: (layoutSidebar: boolean) => void
  setCurConversationId: (curConversationId: string) => void
  setAiFirstMsg: (aiFirstMsg: string) => void
  setConversationList: (conversationList: Array<AiConversation>) => void
  updateConversationList: (updater: (list: Array<AiConversation>) => Array<AiConversation>) => void
  resetAiSharedData: () => void
}

// 默认数据
const defaultAiSharedData: AiSharedData = {
  layoutSidebar: true,
  curConversationId: '',
  aiFirstMsg: '',
  conversationList: []
}

// 创建 Zustand store
export const useAiStore = create<AiStore>((set) => ({
  aiSharedData: defaultAiSharedData,

  setLayoutSidebar: (layoutSidebar: boolean) =>
    set((state) => ({
      aiSharedData: { ...state.aiSharedData, layoutSidebar }
    })),

  setCurConversationId: (curConversationId: string) =>
    set((state) => ({
      aiSharedData: { ...state.aiSharedData, curConversationId }
    })),

  setAiFirstMsg: (aiFirstMsg: string) =>
    set((state) => ({
      aiSharedData: { ...state.aiSharedData, aiFirstMsg }
    })),

  setConversationList: (conversationList: Array<AiConversation>) =>
    set((state) => ({
      aiSharedData: { ...state.aiSharedData, conversationList }
    })),

  updateConversationList: (updater: (list: Array<AiConversation>) => Array<AiConversation>) =>
    set((state) => ({
      aiSharedData: {
        ...state.aiSharedData,
        conversationList: updater(state.aiSharedData.conversationList)
      }
    })),

  resetAiSharedData: () =>
    set(() => ({
      aiSharedData: defaultAiSharedData
    }))
}))
