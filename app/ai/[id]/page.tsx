'use client'

import { AiPromptInput } from '@/app/ai/components/ai-prompt-input'
import { type PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { useParams } from 'next/navigation'
import { useAiStore } from '@/app/ai/store/aiStore'
import { toast } from 'sonner'
import { AiMessage } from '@prisma/client'
import { DefaultChatTransport, UIMessage } from 'ai'
import { generateAiConversationTitle } from '@/app/actions'
import { LayoutHeader } from '@/app/ai/components/layout/header'
import { MessageList } from '../components/message-list'
import dayjs from 'dayjs'

export default function Page() {
  const params = useParams<{ id: string }>()
  const conversationId = params.id

  // 从状态管理获取输入框状态
  const inputText = useAiStore((state) => state.aiSharedData.inputText)
  const selectedModel = useAiStore((state) => state.aiSharedData.selectedModel)
  const useWebSearch = useAiStore((state) => state.aiSharedData.useWebSearch)
  const models = useAiStore((state) => state.aiSharedData.models)

  // 状态管理方法
  const setInputText = useAiStore((state) => state.setInputText)
  const setSelectedModel = useAiStore((state) => state.setSelectedModel)
  const setUseWebSearch = useAiStore((state) => state.setUseWebSearch)

  const aiFirstMsg = useAiStore((state) => state.aiSharedData.aiFirstMsg)
  const setAiFirstMsg = useAiStore((state) => state.setAiFirstMsg)
  const updateConversationList = useAiStore((state) => state.updateConversationList)
  const messagesLoading = useAiStore((state) => state.aiSharedData.messagesLoading)
  const fetchMessages = useAiStore((state) => state.fetchMessages)

  const { status, stop, setMessages, sendMessage, messages } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      // 仅发送最后一条消息
      prepareSendMessagesRequest({ messages, id }) {
        const day = dayjs()

        return {
          body: {
            message: messages[messages.length - 1],
            id,
            timestamp: day.unix(),
            date: day.format('YYYY-MM-DD HH:mm:ss'),
            userTools: {
              enableWebSearch: useWebSearch
            }
          }
        }
      }
    })
  })

  async function setMsg() {
    try {
      const res = await fetchMessages(conversationId)

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
    } catch (error) {
      toast('获取对象详情失败!')
    }
  }

  // 生成对话标题
  async function generateConversationTitle() {
    generateAiConversationTitle(conversationId)
      .then((res) => {
        if (res.code === 0) {
          const conversationName = res.data?.name ?? ''

          updateConversationList((list) =>
            list.map((item) =>
              item.id === conversationId && conversationName
                ? { ...item, name: conversationName }
                : item
            )
          )
        }
      })
      .catch((err) => {
        console.error('生成对话标题失败!', err)
      })
  }

  function firstMsg() {
    sendMessage({ text: aiFirstMsg }).then(() => {
      generateConversationTitle()
      setAiFirstMsg('')
    })
  }

  useEffect(() => {
    if (aiFirstMsg) {
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
          model: selectedModel,
          userTools: {
            enableWebSearch: useWebSearch
          }
        }
      }
    )
    setInputText('')
  }

  return (
    <div className="flex flex-col h-screen">
      <LayoutHeader></LayoutHeader>

      <MessageList messages={messages} status={status} loading={messagesLoading}></MessageList>

      <AiPromptInput
        onSubmit={handleSubmit}
        text={inputText}
        setText={setInputText}
        model={selectedModel}
        setModel={setSelectedModel}
        useWebSearch={useWebSearch}
        setUseWebSearch={setUseWebSearch}
        models={models}
        disabled={!inputText && !status}
        status={status}
        onStop={stop}
        className="my-4 w-10/12 mx-auto"
      />
    </div>
  )
}
