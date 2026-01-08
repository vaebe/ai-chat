import React, { useEffect } from 'react'
import { Loading } from '@/components/ui/loading'
import { useConversationStore } from '../../../store/conversation-store'
import { ConversationItem } from './item'
import { useParams } from 'next/navigation'

export const ConversationList = () => {
  const { id } = useParams()
  const conversationList = useConversationStore((state) => state.conversationList)
  const conversationListLoading = useConversationStore((state) => state.conversationListLoading)
  const fetchConversationList = useConversationStore((state) => state.fetchConversationList)

  useEffect(() => {
    let isMounted = true

    const loadConversations = async () => {
      if (isMounted) {
        await fetchConversationList()
      }
    }

    loadConversations()

    return () => {
      isMounted = false
    }
  }, [fetchConversationList])

  return (
    <div className="w-60 flex flex-col gap-2">
      {conversationListLoading ? (
        <Loading text="加载列表中..." className="p-4" />
      ) : (
        conversationList.map((item) => <ConversationItem key={item.id} item={item} isActive={id === item.id} />)
      )}
    </div>
  )
}
