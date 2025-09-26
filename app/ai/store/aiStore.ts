import { create } from 'zustand'
import { AiConversation } from '@prisma/client'

// 定义数据类型
export interface AiSharedData {
  layoutSidebar: boolean // 对话侧边栏展开状态
  curConversationId: string // 当前对话 id
  aiFirstMsg: string // 首次发送给 ai 的文本
  conversationList: Array<AiConversation>
  // 输入框状态
  inputText: string // 输入框文本
  selectedModel: string // 选中的模型
  useWebSearch: boolean // 是否启用网络搜索
  // 模型列表
  models: Array<{ id: string; name: string }>
}

// 定义 Store 类型
interface AiStore {
  aiSharedData: AiSharedData
  setLayoutSidebar: (layoutSidebar: boolean) => void
  setCurConversationId: (curConversationId: string) => void
  setAiFirstMsg: (aiFirstMsg: string) => void
  setConversationList: (conversationList: Array<AiConversation>) => void
  updateConversationList: (updater: (list: Array<AiConversation>) => Array<AiConversation>) => void
  // 输入框状态管理
  setInputText: (inputText: string) => void
  setSelectedModel: (selectedModel: string) => void
  setUseWebSearch: (useWebSearch: boolean) => void
  resetAiSharedData: () => void
}

// 默认数据
const defaultAiSharedData: AiSharedData = {
  layoutSidebar: true,
  curConversationId: '',
  aiFirstMsg: '',
  conversationList: [],
  // 输入框默认状态
  inputText: '',
  selectedModel: 'deepseek-chat',
  useWebSearch: false,
  // 模型列表
  models: [{ id: 'deepseek-chat', name: 'deepseek-chat' }]
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

  // 输入框状态管理方法
  setInputText: (inputText: string) =>
    set((state) => ({
      aiSharedData: { ...state.aiSharedData, inputText }
    })),

  setSelectedModel: (selectedModel: string) =>
    set((state) => ({
      aiSharedData: { ...state.aiSharedData, selectedModel }
    })),

  setUseWebSearch: (useWebSearch: boolean) =>
    set((state) => ({
      aiSharedData: { ...state.aiSharedData, useWebSearch }
    })),

  resetAiSharedData: () =>
    set(() => ({
      aiSharedData: defaultAiSharedData
    }))
}))
