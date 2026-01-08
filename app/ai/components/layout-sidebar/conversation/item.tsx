import React, { useState, useEffect } from 'react'
import { AiConversation } from '@/generated/prisma/client'
import { useOperations } from './use-operations'
import { ConversationOperations } from './operations'

interface ConversationItemProps {
  item: AiConversation
  isActive: boolean
}

export const ConversationItem = React.memo<ConversationItemProps>(({ item, isActive }) => {
  const { switchConversation } = useOperations()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [shouldShowOperations, setShouldShowOperations] = useState(false)

  useEffect(() => {
    if (isMenuOpen) {
      setShouldShowOperations(true)
    } else {
      const timer = setTimeout(() => {
        setShouldShowOperations(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isMenuOpen])

  const handleMenuOpenChange = (open: boolean) => {
    setIsMenuOpen(open)
  }

  return (
    <div
      className={`group flex items-center justify-between box-border p-2 text-sm cursor-pointer rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 
        ${isActive ? 'bg-black/10 dark:bg-white/10' : ''}`}
    >
      <p className="truncate flex-1" onClick={() => switchConversation(item.id)}>
        {item.name}
      </p>
      <ConversationOperations
        conversation={item}
        className={shouldShowOperations ? 'block' : 'hidden group-hover:block'}
        onMenuOpenChange={handleMenuOpenChange}
      />
    </div>
  )
})

ConversationItem.displayName = 'ConversationItem'
