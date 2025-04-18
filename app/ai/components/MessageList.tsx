'use client'

import { useRef, useEffect, memo, useCallback } from 'react'
import { useChat, Message } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import MarkdownRender from '@/components/MarkdownRender'
import { Icon } from '@iconify/react'
import { useParams } from 'next/navigation'

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

interface MessageListProps {
  className?: string
  isLoading: boolean
}

const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center mt-4">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
))
LoadingSpinner.displayName = 'LoadingSpinner'

const MessageList = ({ className, isLoading }: MessageListProps) => {
  const params = useParams<{ id: string }>()

  const { messages, reload, error } = useChat({
    id: params.id,
    api: '/api/ai/chat',
    keepLastMessageOnError: true,
    experimental_throttle: 50
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  return (
    <ScrollArea style={{ height: `calc(100vh - 150px)`, width: '100%', overflow: 'hidden' }}>
      <div className={cn('w-full md:w-10/12 mx-auto p-4 md:p-0', className)}>
        {messages.map((message, index) => {
          const MessageComponent = message.role === 'assistant' ? AssistantMessage : UserMessage

          const isLast = messages.length === index + 1
          return (
            <div key={message.id}>
              <MessageComponent message={message} />

              <div className="w-[88%] flex items-center justify-end -mt-2 mb-2">
                {isLast && (
                  <Icon
                    icon="pepicons-pop:refresh"
                    width={24}
                    className="cursor-pointer  hover:text-gray-400"
                    onClick={() => reload()}
                  ></Icon>
                )}

                {isLoading && isLast && (
                  <Icon icon="eos-icons:three-dots-loading" width={44}></Icon>
                )}
              </div>
            </div>
          )
        })}

        {/* 发生错误 */}
        {error && (
          <div className="flex items-center space-x-4">
            <p className="text-red-500">{error?.message}</p>

            <div className="cursor-pointer hover:text-gray-400" onClick={() => reload()}>
              <Icon icon="pepicons-pop:refresh" width={24}></Icon>
            </div>
          </div>
        )}
      </div>
      <div ref={messagesEndRef} />
    </ScrollArea>
  )
}

export { MessageList, AssistantMessage, UserMessage }
