'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { Chat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { useInputStore } from '@/app/ai/store/input-store'
import dayjs from 'dayjs'

interface ChatContextValue {
  chat: Chat<UIMessage>
  clearChat: () => void
  onFinish?: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

function createChat(conversationId: string, onFinish?: () => void) {
  return new Chat<UIMessage>({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest({ messages, id }) {
        const day = dayjs()
        return {
          body: {
            message: messages[messages.length - 1],
            id,
            timestamp: day.unix(),
            date: day.format('YYYY-MM-DD HH:mm:ss'),
            model: useInputStore.getState().selectedModel,
            userTools: {
              enableWebSearch: useInputStore.getState().useWebSearch
            }
          }
        }
      }
    }),
    onFinish
  })
}

interface ChatProviderProps {
  children: ReactNode
  conversationId: string
  onFinish?: () => void
}

export function ChatProvider({ children, conversationId, onFinish }: ChatProviderProps) {
  const [chat, setChat] = useState(() => createChat(conversationId, onFinish))

  const clearChat = () => {
    setChat(createChat(conversationId, onFinish))
  }

  return <ChatContext.Provider value={{ chat, clearChat, onFinish }}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
