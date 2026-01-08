import { useRouter, useParams } from 'next/navigation'
import { useConversationStore } from '../../../store/conversation-store'
import { removeAiConversation, updateAiConversation } from '@/app/actions'
import { UseConversationOperationsReturn, AiConversation } from '@/types/ai'
import { toast } from 'sonner'

export function useOperations(): UseConversationOperationsReturn {
  const router = useRouter()
  const { id } = useParams()
  const conversationList = useConversationStore((state) => state.conversationList)
  const updateConversationList = useConversationStore((state) => state.updateConversationList)

  async function removeConversation(conversation: AiConversation) {
    try {
      const res = await removeAiConversation(conversation.id)

      if (res.code === 0) {
        updateConversationList((list) => list.filter((item) => item.id !== conversation.id))
        // 如果删除的是当前对话，跳转到首页
        if (conversation.id === id) {
          router.push('/ai')
        }
      } else {
        toast.error('删除对话失败!')
      }
    } catch (error) {
      toast.error('删除对话失败!')
      console.error('删除对话失败:', error)
    }
  }

  async function updateConversation(conversation: AiConversation, name: string) {
    const rawData = conversationList.find((item) => item.id === conversation.id)
    if (!rawData) {
      return
    }

    try {
      // 直接更新数据
      updateConversationList((list) => list.map((item) => (item.id === conversation.id ? { ...item, name } : item)))

      const res = await updateAiConversation({ id: conversation.id, name })

      if (res.code !== 0) {
        toast.error('更新对话失败!')
        // 数据更新失败，更新回原来的值
        updateConversationList((list) => list.map((item) => (item.id === conversation.id ? rawData : item)))
      }
    } catch (error) {
      updateConversationList((list) => list.map((item) => (item.id === conversation.id ? rawData : item)))
      toast.error('更新对话失败!')
      console.error('更新对话失败:', error)
    }
  }

  function switchConversation(conversationId: string) {
    if (id === conversationId) {
      return
    }
    router.push(`/ai/${conversationId}`)
  }

  return {
    removeConversation,
    updateConversation,
    switchConversation
  }
}
