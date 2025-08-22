'use client'

import { useEffect, memo } from 'react'
import { UIMessage } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import MarkdownRender from '@/components/MarkdownRender'
import { Icon } from '@iconify/react'
import { useChatScroll } from '@/hooks/use-chat-scroll'

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

const UserMessage = memo(({ message }: { message: UIMessage }) => {
  return (
    <div className={`flex items-start space-x-2 mb-4 justify-end`}>
      <Card className="max-w-[88%] px-4 py-2">
        {message.parts.map((part, index) =>
          part.type === 'text' ? <span key={index}>{part.text}</span> : null
        )}
      </Card>
      <MessageAvatar role="user" />
    </div>
  )
})
UserMessage.displayName = 'UserMessage'

const AssistantMessage = memo(({ message }: { message: UIMessage }) => {
  return (
    <div className={`flex items-start space-x-2 mb-4 justify-start`}>
      <MessageAvatar role="assistant" />

      <Card className="w-[88%] px-4 py-2">
        {message.parts.map((part, index) =>
          part.type === 'text' ? <MarkdownRender key={index} content={part.text ?? ''} /> : null
        )}
      </Card>
    </div>
  )
})
AssistantMessage.displayName = 'AssistantMessage'

interface MessageListProps {
  className?: string
  isLoading: boolean
  regenerate: () => void
  error?: Error
  messages: UIMessage[]
}

const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center mt-4">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
))
LoadingSpinner.displayName = 'LoadingSpinner'

const MessageList = ({ className, isLoading, regenerate, messages, error }: MessageListProps) => {
  const { containerRef, scrollToBottom } = useChatScroll()
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return (
    <ScrollArea
      ref={containerRef}
      style={{ height: `calc(100vh - 150px)`, width: '100%', overflow: 'hidden' }}
    >
      <div className={cn('w-full md:w-10/12 mx-auto p-4 md:p-0', className)}>
        {messages.map((message, index) => {
          const MessageComponent = message.role === 'assistant' ? AssistantMessage : UserMessage

          const lastMsg = messages[messages.length - 1]
          const isLast = messages.length === index + 1
          return (
            <div key={message.id}>
              <MessageComponent message={message} />

              {isLast && (
                <div className="w-[92%] h-[30px] flex items-start justify-end -mt-3">
                  {error && <p className="text-red-500 mr-4">{error?.message}</p>}

                  {/* 最后一条且是 ai 回复 */}
                  {lastMsg.role === 'assistant' && !isLoading && (
                    <Icon
                      icon="pepicons-pop:refresh"
                      width={24}
                      className="cursor-pointer  hover:text-gray-400"
                      onClick={() => regenerate()}
                    ></Icon>
                  )}

                  {isLoading && <Icon icon="eos-icons:three-dots-loading" width={44}></Icon>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

export { MessageList, AssistantMessage, UserMessage }
