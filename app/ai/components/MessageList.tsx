'use client'

import { useRef, useEffect, memo, useMemo } from 'react'
import type { Message } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import MarkdownRender from '@/components/MarkdownRender'

const UserMessage = memo(({ message }: { message: Message }) => {
  return (
    <>
      <Card className="max-w-[88%] px-4 py-2">{message.content ?? ''}</Card>
      <Avatar>
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
        <AvatarImage src="/user-avatar.png" alt="User Avatar" />
      </Avatar>
    </>
  )
})
UserMessage.displayName = 'UserMessage'

const AssistantMessage = memo(({ message }: { message: Message }) => {
  return (
    <>
      <Avatar>
        <AvatarFallback>AI</AvatarFallback>
        <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
      </Avatar>
      <Card className="w-[88%] px-4 py-2">
        <MarkdownRender content={message.content ?? ''} />
      </Card>
    </>
  )
})
AssistantMessage.displayName = 'AssistantMessage'

const MessageInfo = memo(({ message }: { message: Message }) => {
  return (
    <div
      key={message.id}
      className={`flex items-start space-x-2 mb-4 ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {message.role === 'assistant' ? (
        <AssistantMessage message={message} />
      ) : (
        <UserMessage message={message} />
      )}
    </div>
  )
})
MessageInfo.displayName = 'MessageInfo'

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
    scrollElement.scrollTop = scrollElement.scrollHeight
  }, [messages])

  const messageList = useMemo(
    () => messages.map((message) => <MessageInfo key={message.id} message={message} />),
    [messages]
  )

  return (
    <ScrollArea
      ref={scrollAreaRef}
      style={{ height: `calc(100vh - 150px)`, width: '100%', overflow: 'hidden' }}
    >
      <div className={cn('w-full md:w-10/12 mx-auto', className)}>
        {messageList}
        {isLoading && <LoadingSpinner />}
      </div>
    </ScrollArea>
  )
})
MessageList.displayName = 'MessageList'

export { MessageList, AssistantMessage, UserMessage }
