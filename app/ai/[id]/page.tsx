'use client'

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools
} from '@/components/ai-elements/prompt-input'
import { GlobeIcon, RefreshCcwIcon, CopyIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { useParams } from 'next/navigation'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { AiSharedDataContext } from '@/app/ai/components/AiSharedDataContext'
import { useContext, Fragment } from 'react'
import { toast } from 'sonner'
import { AiMessage } from '@prisma/client'
import { DefaultChatTransport, UIMessage } from 'ai'
import { generateAiConversationTitle, getAiMessages } from '@/app/actions'
import { LayoutHeader } from '@/app/ai/components/layout/header'
import { Loader } from '@/components/ai-elements/loader'
import { Actions, Action } from '@/components/ai-elements/actions'

const models = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' }
]

export default function Page() {
  const params = useParams<{ id: string }>()
  const conversationId = params.id

  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<string>(models[0].id)
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false)

  const { aiSharedData, setAiSharedData } = useContext(AiSharedDataContext)

  const [lastAiMsgId, setLastAiMsgId] = useState('')

  const { status, stop, setMessages, sendMessage, messages, regenerate } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      // 仅发送最后一条消息
      prepareSendMessagesRequest({ messages, id, trigger }) {
        const lastMessage = messages[messages.length - 1]
        console.log('prepareSendMessagesRequest', { lastMessage, id, trigger, lastAiMsgId })
        return { body: { message: lastMessage, id, trigger, lastAiMsgId } }
      }
    }),
    onFinish: ({ message }) => {
      setLastAiMsgId(message.id)
    }
  })

  async function setMsg() {
    getAiMessages(conversationId)
      .then((res) => {
        if (res.code !== 0) {
          toast('获取对象详情失败!')
          return
        }

        const data = res?.data ?? []

        const list = data.map((item: AiMessage) => ({
          parts: JSON.parse(item.parts),
          metadata: JSON.parse(item.metadata ?? '{}'),
          role: item.role,
          id: item.id
        })) as UIMessage[]

        console.log('历史消息', list)

        setMessages(list)
      })
      .catch(() => {
        toast('获取对象详情失败!')
      })
  }

  // 生成对话标题
  async function generateConversationTitle() {
    generateAiConversationTitle(conversationId)
      .then((res) => {
        if (res.code === 0) {
          const conversationName = res.data?.name ?? ''

          setAiSharedData((d) => {
            d.conversationList = d.conversationList.map((item) => {
              if (item.id === conversationId && conversationName) {
                item.name = conversationName
              }
              return item
            })
          })
        }
      })
      .catch((err) => {
        console.error('生成对话标题失败!', err)
      })
  }

  function firstMsg() {
    sendMessage({ text: aiSharedData.aiFirstMsg }).then(() => {
      generateConversationTitle()

      setAiSharedData((d) => {
        d.aiFirstMsg = ''
      })
    })
  }

  useEffect(() => {
    if (aiSharedData.aiFirstMsg) {
      firstMsg()
    } else {
      setMsg()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files
      },
      {
        body: {
          model: model,
          webSearch: useWebSearch
        }
      }
    )
    setText('')
  }

  return (
    <div className="flex flex-col h-screen">
      <LayoutHeader></LayoutHeader>
      <Conversation>
        <ConversationContent className="max-w-10/12 mx-auto">
          {messages.map((message, messageIndex) => (
            <Fragment key={message.id}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    const isLastMessage = messageIndex === messages.length - 1

                    return (
                      <Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <MessageContent>
                            <Response>{part.text}</Response>
                          </MessageContent>
                        </Message>
                        {message.role === 'assistant' && isLastMessage && (
                          <Actions>
                            <Action onClick={() => regenerate()} label="Retry">
                              <RefreshCcwIcon className="size-3" />
                            </Action>
                            <Action
                              onClick={() => navigator.clipboard.writeText(part.text)}
                              label="Copy"
                            >
                              <CopyIcon className="size-3" />
                            </Action>
                          </Actions>
                        )}
                      </Fragment>
                    )
                  default:
                    return null
                }
              })}
            </Fragment>
          ))}

          {status === 'submitted' && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="my-4 w-10/12 mx-auto" globalDrop multiple>
        <PromptInputBody>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            placeholder="询问任何问题？"
          />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton
              onClick={() => setUseWebSearch(!useWebSearch)}
              variant={useWebSearch ? 'default' : 'ghost'}
            >
              <GlobeIcon size={16} />
              <span>搜索</span>
            </PromptInputButton>
            <PromptInputModelSelect
              onValueChange={(value) => {
                setModel(value)
              }}
              value={model}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map((model) => (
                  <PromptInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>

          <PromptInputSubmit disabled={!text && !status} status={status} onClick={stop} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}
