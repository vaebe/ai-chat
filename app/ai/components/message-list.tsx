'use client'

import { useEffect, memo } from 'react'
import { UIMessage } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import MarkdownRender from '@/components/markdown-render'
import { Icon } from '@iconify/react'
import { useChatScroll } from '@/hooks/use-chat-scroll'

interface MessageProps {
  message: UIMessage
}

const UserMessage = memo(({ message }: MessageProps) => {
  return (
    <div className="flex justify-end mb-10">
      <Card className="p-2">
        {message.parts.map((part, index) =>
          part.type === 'text' ? <span key={index}>{part.text}</span> : null
        )}
      </Card>
    </div>
  )
})
UserMessage.displayName = 'UserMessage'

interface PartOutput {
  structuredContent?: { result?: string }
  content?: { type: string; text: string }[]
}

/** 规范化 parts，支持 dynamic-tool / structuredContent */
function normalizeParts(parts: UIMessage['parts']) {
  const normalized: { type: string; text?: string }[] = []

  for (const part of parts) {
    if (part.type === 'text' && part.text) {
      normalized.push({ type: 'text', text: part.text })
    } else if (part.type === 'dynamic-tool' && part.state === 'output-available') {
      const output = part.output as PartOutput

      const text =
        output?.structuredContent?.result ||
        output?.content
          ?.filter((p) => p.type === 'text')
          .map((p) => p.text)
          .join('\n')
      if (text) normalized.push({ type: 'text', text })
    }
  }

  return normalized
}

const AssistantMessage = memo(({ message }: MessageProps) => {
  const parts = normalizeParts(message.parts)
  return (
    <div className="mb-10">
      {parts.map((part, index) =>
        part.type === 'text' ? <MarkdownRender key={index} content={part.text ?? ''} /> : null
      )}
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
                <div className="h-[30px] flex -mt-3">
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

                  {isLoading && <Loader className="h-6 w-6 animate-spin"></Loader>}
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
