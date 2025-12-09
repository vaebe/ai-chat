import React from 'react'
import { AiConversation } from '@/generated/prisma/client'
import { useConversationOperations } from '../../hooks/use-conversation-operations'
import { ConversationOperations } from './conversation-operations'

interface ConversationItemProps {
  item: AiConversation
  isActive: boolean
}

export const ConversationItem = React.memo<ConversationItemProps>(({ item, isActive }) => {
  const { switchConversation } = useConversationOperations()

  return (
    <div
      className={`flex items-center justify-between p-2 text-sm cursor-pointer rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 ${
        isActive ? 'bg-black/10 dark:bg-white/10' : ''
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      <p
        className="overflow-hidden whitespace-nowrap"
        style={{ width: `calc(100% - 30px)` }}
        onClick={() => switchConversation(item.id)}
      >
        {item.name}
      </p>
      <ConversationOperations conversation={item} />
    </div>
  )
})

ConversationItem.displayName = 'ConversationItem'
