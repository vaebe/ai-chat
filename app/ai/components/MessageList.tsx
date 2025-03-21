'use client'

import { useRef, useEffect, memo, useMemo } from 'react'
import type { Message } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import MarkdownRender from '@/components/MarkdownRender'

const MessageAvatar = ({ role }: { role: 'user' | 'assistant' }) => (
  <Avatar>
    <AvatarFallback>
      {role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </AvatarFallback>
    <AvatarImage
      src={role === 'assistant' ? '/ai-avatar.png' : '/user-avatar.png'}
      alt={`${role} Avatar`}
    />
  </Avatar>
)

const UserMessage = memo(({ message }: { message: Message }) => {
  return (
    <div className={`flex items-start space-x-2 mb-4 justify-end`}>
      <Card className="max-w-[88%] px-4 py-2">{message.content ?? ''}</Card>
      <MessageAvatar role="user" />
    </div>
  )
})
UserMessage.displayName = 'UserMessage'

const AssistantMessage = memo(({ message }: { message: Message }) => {
  return (
    <div className={`flex items-start space-x-2 mb-4 justify-start`}>
      <MessageAvatar role="assistant" />
      <Card className="w-[88%] px-4 py-2">
        <MarkdownRender content={message.content ?? ''} />
      </Card>
    </div>
  )
})
AssistantMessage.displayName = 'AssistantMessage'

const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center mt-4">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
))
LoadingSpinner.displayName = 'LoadingSpinner'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  className?: string
}

const MessageList = memo(({ messages, isLoading, className }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')

    if (!scrollElement) return

    requestAnimationFrame(() => {
      scrollElement.scrollTop = scrollElement.scrollHeight
    })
  }, [messages])

  const messageList = useMemo(
    () =>
      messages.map((message, index) => {
        const MessageComponent = message.role === 'assistant' ? AssistantMessage : UserMessage
        return <MessageComponent key={index} message={message} />
      }),
    [messages]
  )

  return (
    <ScrollArea
      ref={scrollAreaRef}
      style={{ height: `calc(100vh - 150px)`, width: '100%', overflow: 'hidden' }}
    >
      <div className={cn('w-full md:w-10/12 mx-auto p-4 md:p-0', className)}>
        {messageList}
        {isLoading && <LoadingSpinner />}
      </div>
    </ScrollArea>
  )
})
MessageList.displayName = 'MessageList'

export { MessageList, AssistantMessage, UserMessage }
