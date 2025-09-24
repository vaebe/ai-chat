'use client'

import { CopyIcon } from 'lucide-react'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Fragment } from 'react'
import { ChatStatus, UIMessage } from 'ai'
import { Loader } from '@/components/ai-elements/loader'
import { Actions, Action } from '@/components/ai-elements/actions'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  getStatusBadge
} from '@/components/ai-elements/tool'

interface MessageListProps {
  messages: UIMessage[]
  status: ChatStatus
}

export function MessageList({ messages, status }: MessageListProps) {
  const isDone = !['submitted', 'streaming'].includes(status)

  return (
    <Conversation>
      <ConversationContent className="max-w-10/12 mx-auto">
        {messages.map((message, messageIndex) => {
          return (
            <div key={message.id}>
              <ToolsInfo message={message}></ToolsInfo>

              <IMessage
                message={message}
                messageIndex={messageIndex}
                messagesLen={messages.length}
                isDone={isDone}
              ></IMessage>
            </div>
          )
        })}

        {!isDone && <Loader />}
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
}

function IMessage({ message, messageIndex, messagesLen, isDone }: IMessageProps) {
  const part = message.parts[message.parts.length - 1]

  if (!part) {
    return null
  }

  const isLastMessage = messageIndex === messagesLen - 1

  const showActions = message.role === 'assistant' && isLastMessage && isDone

  if (part.type === 'text') {
    return (
      <Fragment>
        <Message from={message.role}>
          <MessageContent>
            <Response>{part.text}</Response>
          </MessageContent>
        </Message>

        {showActions && (
          <Actions>
            <Action onClick={() => navigator.clipboard.writeText(part.text)} label="Copy">
              <CopyIcon className="size-4" />
            </Action>
          </Actions>
        )}
      </Fragment>
    )
  }

  if (part.type === 'dynamic-tool') {
    return (
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{part.toolName}</p>

        {getStatusBadge(part.state)}
      </div>
    )
  }

  return <Response>{part.type}</Response>
}

interface ToolsInfoProps {
  message: UIMessage
}

function ToolsInfo({ message }: ToolsInfoProps) {
  const tools = message.parts.filter((item) => item.type === 'dynamic-tool')

  const lastTool = tools[tools.length - 1]

  if (!lastTool) {
    return null
  }

  return (
    <Tool defaultOpen={false} className="mb-0">
      <ToolHeader type={`tool-${lastTool.toolName}`} state={lastTool.state} />
      <ToolContent>
        <ul>
          {tools.map((item, index) => {
            return (
              <li key={index}>
                <div className="px-4 flex items-center justify-between">
                  <p className="text-gray-600">{item.toolName}</p>

                  {getStatusBadge(item.state)}
                </div>

                <ToolInput input={item.input} />
              </li>
            )
          })}
        </ul>
      </ToolContent>
    </Tool>
  )
}
