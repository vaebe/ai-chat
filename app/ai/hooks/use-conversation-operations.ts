import { useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useConversationStore } from '../store/conversation-store'
import { removeAiConversation, updateAiConversation } from '@/app/actions'
import { UseConversationOperationsReturn, AiConversation } from '@/types/ai'

export function useConversationOperations(): UseConversationOperationsReturn {
  const router = useRouter()
  const { id } = useParams()
  const updateConversationList = useConversationStore((state) => state.updateConversationList)

  const removeConversation = useCallback(
    async (conversation: AiConversation) => {
      try {
        const res = await removeAiConversation(conversation.id)

        if (res.code === 0) {
          updateConversationList((list) => list.filter((item) => item.id !== conversation.id))

          // 如果删除的是当前对话，跳转到首页
          if (conversation.id === id) {
            router.push('/ai')
          }
        }
      } catch (error) {
        console.error('删除对话失败:', error)
      }
    },
    [updateConversationList, router, id]
  )

  const updateConversation = useCallback(
    async (conversation: AiConversation, name: string) => {
      try {
        const res = await updateAiConversation({ id: conversation.id, name })

        if (res.code === 0) {
          updateConversationList((list) =>
            list.map((item) => (item.id === conversation.id ? { ...item, name } : item))
          )
        }
      } catch (error) {
        console.error('更新对话失败:', error)
      }
    },
    [updateConversationList]
  )

  const switchConversation = useCallback(
    (conversationId: string) => {
      if (id === conversationId) {
        return
      }
      router.push(`/ai/${conversationId}`)
    },
    [router, id]
  )

  return {
    removeConversation,
    updateConversation,
    switchConversation
  }
}
