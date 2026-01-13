'use client'

import { useParams } from 'next/navigation'
import { useInputStore } from '@/app/ai/store/input-store'
import { useConversationStore } from '@/app/ai/store/conversation-store'
import { useUIStore } from '@/app/ai/store/ui-store'
import { useMessageOperations } from '@/app/ai/hooks/use-message-operations'
import { useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { getAiGatewayModels } from '@/lib/utils'
import { ChatProvider, useChatContext } from '@/app/ai/context/chat-context'
import { MessageList } from './components/message-list'
import { ChatMessageInput } from './components/chat-message-input'
import { toast } from 'sonner'

function ChatContent({ conversationId }: { conversationId: string }) {
  const aiFirstMsg = useConversationStore((state) => state.aiFirstMsg)
  const { fetchMessages, processMessages } = useMessageOperations()

  const { chat } = useChatContext()
  const { messages, status, setMessages, sendMessage } = useChat({ chat })

  const messagesLoading = useUIStore((state) => state.messagesLoading)

  // 使用 useRef 追踪是否已经初始化过，防止重复加载
  const initializedRef = useRef(false)

  // 初始化消息
  useEffect(() => {
    const initializeMessages = async () => {
      // 如果已经初始化过，不再执行
      if (initializedRef.current) {
        return
      }

      if (aiFirstMsg) {
        sendMessage({ text: aiFirstMsg })
      } else {
        const res = await fetchMessages(conversationId)

        if (res.code !== 0) {
          toast('获取对话详情失败!')
          return
        }

        const data = res?.data ?? []
        const list = processMessages(data)
        console.log('历史消息', list)
        setMessages(list)
      }

      // 标记为已初始化
      initializedRef.current = true
    }

    initializeMessages()
  }, [conversationId])

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} status={status} loading={messagesLoading} />
      <ChatMessageInput className="my-4 w-8/12 mx-auto" />
    </div>
  )
}

export default function Page() {
  const conversationId = useParams<{ id: string }>().id

  const setAiFirstMsg = useConversationStore((state) => state.setAiFirstMsg)
  const { generateConversationTitle } = useMessageOperations()

  const handleFinish = () => {
    // 直接从 store 获取最新的 aiFirstMsg 值
    const currentAiFirstMsg = useConversationStore.getState().aiFirstMsg
    // 第一次对话完成后生成对话标题
    if (currentAiFirstMsg) {
      generateConversationTitle(conversationId)
      setAiFirstMsg('')
    }
  }

  const setModels = useInputStore((state) => state.setModels)

  useEffect(() => {
    getAiGatewayModels().then((models) => {
      setModels(models)
    })
  }, [])

  return (
    <ChatProvider key={conversationId} conversationId={conversationId} onFinish={handleFinish}>
      <ChatContent conversationId={conversationId} />
    </ChatProvider>
  )
}
