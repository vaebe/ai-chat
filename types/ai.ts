import { AiConversation, AiMessage } from '@/generated/prisma/client'
import { UIMessage } from 'ai'
import { type GatewayLanguageModelEntry } from '@ai-sdk/gateway'

// 重新导出 Prisma 类型
export type { AiConversation, AiMessage }

// 对话相关类型
export interface ConversationState {
  conversationList: AiConversation[]
  conversationListLoading: boolean
  curConversationId: string
  aiFirstMsg: string
}

export interface ConversationActions {
  setConversationList: (conversationList: AiConversation[]) => void
  updateConversationList: (updater: (list: AiConversation[]) => AiConversation[]) => void
  setConversationListLoading: (loading: boolean) => void
  setCurConversationId: (curConversationId: string) => void
  setAiFirstMsg: (aiFirstMsg: string) => void
  fetchConversationList: () => Promise<void>
  resetConversationState: () => void
}

// 输入相关类型
export interface InputState {
  inputText: string
  selectedModel: string
  useWebSearch: boolean
  models: GatewayLanguageModelEntry[]
}

export interface InputActions {
  setInputText: (inputText: string) => void
  setSelectedModel: (selectedModel: string) => void
  setUseWebSearch: (useWebSearch: boolean) => void
  setModels: (models: GatewayLanguageModelEntry[]) => void
  resetInputState: () => void
}

// UI 相关类型
export interface UIState {
  layoutSidebar: boolean
  messagesLoading: boolean
}

export interface UIActions {
  setLayoutSidebar: (layoutSidebar: boolean) => void
  setMessagesLoading: (messagesLoading: boolean) => void
  resetUIState: () => void
}

// 消息相关类型
export interface MessageOperations {
  fetchMessages: (conversationId: string) => Promise<ApiResponse<AiMessage[]>>
  generateConversationTitle: (conversationId: string) => Promise<void>
  processMessages: (messages: AiMessage[]) => UIMessage[]
  setAiFirstMsg: (message: string) => void
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
}

export interface PaginationResponse<T> extends ApiResponse<{
  list: T[]
  total: number
  currentPage: number
  totalPages: number
}> {}

// 组件 Props 类型
export interface ConversationItemProps {
  item: AiConversation
  isActive: boolean
}

export interface ConversationOperationsProps {
  conversation: AiConversation
}

export interface MessageListProps {
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'done'
  loading?: boolean
}

export interface IMessageProps {
  message: UIMessage
  messageIndex: number
  messagesLen: number
  isDone: boolean
  isLastMessage: boolean
}

export interface ToolsInfoProps {
  message: UIMessage
}

// Hook 返回类型
export interface UseConversationOperationsReturn {
  removeConversation: (conversation: AiConversation) => Promise<void>
  updateConversation: (conversation: AiConversation, name: string) => Promise<void>
  switchConversation: (conversationId: string) => void
}

export interface UseMessageOperationsReturn {
  fetchMessages: (conversationId: string) => Promise<ApiResponse<AiMessage[]>>
  generateConversationTitle: (conversationId: string) => Promise<void>
  processMessages: (messages: AiMessage[]) => UIMessage[]
  setAiFirstMsg: (message: string) => void
}

// 工具相关类型
export interface WebSearchResult {
  title: string
  url: string
  content: string
  publishedDate?: string
}

export interface ToolConfig {
  enableWebSearch?: boolean
}

// 错误类型
export interface AppError extends Error {
  code?: number
  status?: number
}

// 表单验证类型
export interface CreateConversationForm {
  name: string
  uid: string
}

export interface UpdateConversationForm {
  name: string
  id: string
  desc?: string
}
