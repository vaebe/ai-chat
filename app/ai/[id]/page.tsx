'use client'

import { useParams } from 'next/navigation'
import { useInputStore } from '@/app/ai/store/input-store'
import { useAiStore } from '@/app/ai/store/ai-store'
import { useUIStore } from '@/app/ai/store/ui-store'
import { useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { getAiGatewayModels } from '@/lib/utils'
import { ChatProvider, useChatContext } from '@/app/ai/context/chat-context'
import { MessageList } from '../components/message-list'
import { ChatPromptInput } from '../components/chat-prompt-input'
import { toast } from 'sonner'
import { AiMessage } from '@/generated/prisma/client'
import { UIMessage } from 'ai'
import { generateAiConversationTitle } from '@/app/actions'

function ChatContent({ conversationId }: { conversationId: string }) {
  const { chat } = useChatContext()
  const { messages, status, setMessages, sendMessage } = useChat({ chat })

  const aiFirstMsg = useAiStore((state) => state.aiFirstMsg)
  const setAiFirstMsg = useAiStore((state) => state.setAiFirstMsg)
  const updateConversationList = useAiStore((state) => state.updateConversationList)
  const fetchMessages = useAiStore((state) => state.fetchMessages)
  const messagesLoading = useUIStore((state) => state.messagesLoading)

  // 生成对话标题
  const generateConversationTitle = () => {
    generateAiConversationTitle(conversationId)
      .then((res) => {
        if (res.code === 0) {
          const conversationName = res.data?.name ?? ''
          updateConversationList((list) =>
            list.map((item) =>
              item.id === conversationId && conversationName ? { ...item, name: conversationName } : item
            )
          )
        }
      })
      .catch((err) => {
        console.error('生成对话标题失败!', err)
      })
  }

  // 设置历史消息
  const setMsg = async () => {
    try {
      const res = await fetchMessages(conversationId)

      if (res.code !== 0) {
        toast('获取对话详情失败!')
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
    } catch {
      toast('获取对话详情失败!')
    }
  }

  // 发送首条消息
  const firstMsg = () => {
    sendMessage({ text: aiFirstMsg }).then(() => {
      generateConversationTitle()
      setAiFirstMsg('')
    })
  }

  // 初始化消息
  useEffect(() => {
    let isMounted = true

    const initializeMessages = async () => {
      if (aiFirstMsg) {
        if (isMounted) {
          firstMsg()
        }
      } else {
        if (isMounted) {
          await setMsg()
        }
      }
    }

    initializeMessages()

    return () => {
      isMounted = false
    }
  }, [conversationId])

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} status={status} loading={messagesLoading} />
      <ChatPromptInput className="my-4 w-8/12 mx-auto" />
    </div>
  )
}

export default function Page() {
  const params = useParams<{ id: string }>()
  const conversationId = params.id

  const setModels = useInputStore((state) => state.setModels)

  useEffect(() => {
    getAiGatewayModels().then((models) => {
      setModels(models)
    })
  }, [setModels])

  return (
    <ChatProvider key={conversationId} conversationId={conversationId}>
      <ChatContent conversationId={conversationId} />
    </ChatProvider>
  )
}
