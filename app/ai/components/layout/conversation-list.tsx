import React, { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loading } from '@/components/ui/loading'
import { useConversationStore } from '../../store/conversation-store'
import { ConversationItem } from './conversation-item'
import { useParams } from 'next/navigation'

export const ConversationList = React.memo(() => {
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
    <ScrollArea className="h-[92vh]">
      <div className="w-64 p-2 space-y-1">
        {conversationListLoading ? (
          <Loading text="加载列表中..." className="p-4" />
        ) : (
          conversationList.map((item) => (
            <ConversationItem key={item.id} item={item} isActive={id === item.id} />
          ))
        )}
      </div>
    </ScrollArea>
  )
})

ConversationList.displayName = 'ConversationList'
