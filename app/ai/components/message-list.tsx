'use client'

import { CopyIcon } from 'lucide-react'
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Fragment } from 'react'
import { ChatStatus, TextUIPart, UIMessage } from 'ai'
import { Loader } from '@/components/ai-elements/loader'
import { Actions, Action } from '@/components/ai-elements/actions'
import { Loading } from '@/components/ui/loading'
import { Tool, ToolContent, ToolHeader, ToolInput, getStatusBadge } from '@/components/ai-elements/tool'
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources'
import { ExaSearchResult } from '@exalabs/ai-sdk'
import React from 'react'
import { toast } from 'sonner'

function handleCopy(part: TextUIPart) {
  if (part && part.type === 'text' && 'text' in part) {
    navigator.clipboard
      .writeText(part.text)
      .then(() => {
        toast.success('复制成功!')
      })
      .catch(() => {
        toast.warning('复制失败!')
      })
  }
}

interface MessageListProps {
  messages: UIMessage[]
  status: ChatStatus
  loading?: boolean
}

export const MessageList = ({ messages, status, loading = false }: MessageListProps) => {
  const isDone = !['submitted', 'streaming'].includes(status)

  const processedMessages = messages.map((message, messageIndex) => ({
    message,
    messageIndex,
    isLastMessage: messageIndex === messages.length - 1
  }))

  return (
    <Conversation>
      <ConversationContent className="max-w-8/12 mx-auto">
        {loading ? (
          <Loading text="加载消息中..." size="lg" className="p-8" />
        ) : (
          processedMessages.map(({ message, messageIndex, isLastMessage }) => (
            <div key={message.id}>
              <ToolsInfo message={message} />
              <WebSearchInfo message={message} />
              <IMessage
                message={message}
                messageIndex={messageIndex}
                messagesLen={messages.length}
                isDone={isDone}
                isLastMessage={isLastMessage}
              />
            </div>
          ))
        )}

        {!isDone && !loading && <Loader />}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

interface IMessageProps {
  message: UIMessage
  messageIndex: number
  messagesLen: number
  isDone: boolean
  isLastMessage: boolean
}

const IMessage = ({ message, isDone, isLastMessage }: IMessageProps) => {
  const textParts = message.parts.filter((item) => item.type === 'text')
  const part = textParts[textParts.length - 1]

  const isSkippable = !part || ['dynamic-tool', 'tool-web_search'].includes(part.type)

  let showCopyAction = message.role === 'assistant'
  if (isLastMessage) {
    showCopyAction = isDone
  }

  if (isSkippable) {
    return null
  }

  if (part.type === 'text') {
    return (
      <Fragment>
        <Message from={message.role}>
          <MessageContent>
            <Response>{'text' in part ? part.text : ''}</Response>
          </MessageContent>
        </Message>

        <Actions>
          {showCopyAction && (
            <Action onClick={() => handleCopy(part)} label="Copy">
              <CopyIcon className="size-4" />
            </Action>
          )}
        </Actions>
      </Fragment>
    )
  }

  return <Response>{part.type}</Response>
}

interface ToolsInfoProps {
  message: UIMessage
}

const WebSearchInfo = ({ message }: ToolsInfoProps) => {
  const parts = message.parts.filter((item) => item.type === 'tool-web_search') as Array<{
    output: ExaSearchResult[]
  }>

  const results: ExaSearchResult[] = []

  parts.forEach((part) => {
    if (part?.output && Array.isArray(part.output)) {
      results.push(...(part.output as ExaSearchResult[]))
    }
  })

  if (results.length === 0) {
    return null
  }

  return (
    <Sources>
      <SourcesTrigger count={results.length} />
      <SourcesContent>
        {results.map((item, index) => (
          <Source href={item.url} title={item.title ?? ''} key={index} />
        ))}
      </SourcesContent>
    </Sources>
  )
}

const ToolsInfo = ({ message }: ToolsInfoProps) => {
  const tools = message.parts.filter((item) => item.type === 'dynamic-tool')

  const lastTool = tools[tools.length - 1]

  if (!lastTool) {
    return null
  }

  return (
    <Tool defaultOpen={false}>
      <ToolHeader state={lastTool.state} type={`tool-${lastTool.toolName}`} />
      <ToolContent>
        <ul>
          {tools.map((item, index) => (
            <li key={index}>
              <div className="px-4 flex items-center justify-between">
                <p className="text-gray-600">{item.toolName}</p>
                {getStatusBadge(item.state)}
              </div>
              <ToolInput input={item.input} />
            </li>
          ))}
        </ul>
      </ToolContent>
    </Tool>
  )
}
