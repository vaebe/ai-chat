import { useCallback } from 'react'
import { useConversationStore } from '../store/conversation-store'
import { useUIStore } from '../store/ui-store'
import { getAiMessages } from '@/app/actions'
import { generateAiConversationTitle } from '@/app/actions'
import { UseMessageOperationsReturn, ApiResponse } from '@/types/ai'
import { AiMessage } from '@prisma/client'
import { UIMessage } from 'ai'

export function useMessageOperations(): UseMessageOperationsReturn {
  const setAiFirstMsg = useConversationStore((state) => state.setAiFirstMsg)
  const updateConversationList = useConversationStore((state) => state.updateConversationList)
  const setMessagesLoading = useUIStore((state) => state.setMessagesLoading)

  const fetchMessages = useCallback(
    async (conversationId: string): Promise<ApiResponse<AiMessage[]>> => {
      setMessagesLoading(true)

      try {
        const res = await getAiMessages(conversationId)
        setMessagesLoading(false)
        return res
      } catch (error) {
        setMessagesLoading(false)
        console.error('获取消息失败:', error)
        throw error
      }
    },
    [setMessagesLoading]
  )

  const generateConversationTitle = useCallback(
    async (conversationId: string) => {
      try {
        const res = await generateAiConversationTitle(conversationId)

        if (res.code === 0) {
          const conversationName = res.data?.name ?? ''

          updateConversationList((list) =>
            list.map((item) =>
              item.id === conversationId && conversationName
                ? { ...item, name: conversationName }
                : item
            )
          )
        }
      } catch (error) {
        console.error('生成对话标题失败:', error)
      }
    },
    [updateConversationList]
  )

  const processMessages = useCallback((messages: AiMessage[]): UIMessage[] => {
    return messages.map((item: AiMessage) => ({
      parts: JSON.parse(item.parts),
      metadata: JSON.parse(item.metadata ?? '{}'),
      role: item.role,
      id: item.id
    })) as UIMessage[]
  }, [])

  return {
    fetchMessages,
    generateConversationTitle,
    processMessages,
    setAiFirstMsg
  }
}
