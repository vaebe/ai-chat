'use client'

import { useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { MessageList } from '@/app/ai/components/MessageList'
import { AiSharedDataContext } from '@/app/ai/components/AiSharedDataContext'
import { useContext } from 'react'
import { LayoutHeader } from '@/app/ai/components/LayoutHeader'
import { Sender } from '@/app/ai/components/Sender'
import { toast } from 'sonner'
import { AIMessage } from '@prisma/client'
import { useParams } from 'next/navigation'
import { DefaultChatTransport, UIMessage } from 'ai'
import { generateAiConversationTitle, getAiMessages } from '@/app/actions'

export default function AIChatPage() {
  const params = useParams<{ id: string }>()
  const conversationId = params.id

  const { aiSharedData, setAiSharedData } = useContext(AiSharedDataContext)

  const { status, stop, setMessages, sendMessage, messages, regenerate, error } = useChat({
    id: conversationId,
    transport: new DefaultChatTransport({
      api: '/api/ai/chat'
      // 仅发送最后一条消息
      // prepareSendMessagesRequest({ messages, id }) {
      //   return { body: { message: messages[messages.length - 1], id } }
      // }
    }),
    onFinish: () => {}
  })

  const [input, setInput] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(['submitted', 'streaming'].includes(status))
  }, [status])

  async function setMsg() {
    getAiMessages(conversationId)
      .then((res) => {
        if (res.code !== 0) {
          toast('获取对象详情失败!')
          return
        }

        const data = res?.data ?? []

        const list = data.map((item: AIMessage) => ({
          parts: JSON.parse(item.parts),
          metadata: JSON.parse(item.metadata ?? '{}'),
          role: item.role,
          id: item.id
        })) as UIMessage[]

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
        console.log('生成对话标题', res)

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

  const onSubmit = () => {
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex flex-col h-screen">
      <LayoutHeader></LayoutHeader>

      <MessageList
        isLoading={isLoading}
        regenerate={regenerate}
        messages={messages}
        error={error}
      ></MessageList>

      <div className="flex justify-center w-full px-2 md:px-0 md:w-10/12 mx-auto md:pb-6 ">
        <Sender
          onSubmit={onSubmit}
          input={input}
          isLoading={isLoading}
          stop={stop}
          setInput={setInput}
        ></Sender>
      </div>
    </div>
  )
}
