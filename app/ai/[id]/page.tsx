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

export default function AIChatPage() {
  const params = useParams<{ id: string }>()
  const conversationId = params.id

  const { aiSharedData, setAiSharedData } = useContext(AiSharedDataContext)

  const { input, handleSubmit, setInput, status, stop, append, setMessages } = useChat({
    id: conversationId,
    api: '/api/ai/chat',
    keepLastMessageOnError: true,
    experimental_throttle: 50
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(['submitted', 'streaming'].includes(status))
  }, [status])

  async function setMsg() {
    try {
      const url = `/api/ai/messages/details?id=${conversationId}`
      const res = await fetch(url).then((res) => res.json())

      if (res.code !== 0) {
        toast('获取对象详情失败!')
        return
      }

      const data = res?.data ?? []

      const list = data.map((item: AIMessage) => ({
        content: item.content,
        role: item.role,
        id: item.id
      }))

      setMessages(list)
    } catch {
      toast('获取对象详情失败!')
    }
  }

  // 生成对话标题
  async function generateConversationTitle() {
    try {
      const url = `/api/ai/conversation/generateTitle?conversationId=${conversationId}`
      const res = await fetch(url).then((res) => res.json())

      if (res.code !== 0) {
        return
      }

      const conversationName = res.data?.name

      setAiSharedData((d) => {
        d.conversationList = d.conversationList.map((item) => {
          if (item.id === conversationId && conversationName) {
            item.name = conversationName
          }
          return item
        })
      })
    } catch {
      console.error('生成对话标题失败!')
    }
  }

  useEffect(() => {
    if (aiSharedData.aiFirstMsg) {
      append(
        { content: aiSharedData.aiFirstMsg, role: 'user' },
        {
          data: { conversationId }
        }
      ).then(() => {
        generateConversationTitle()

        setAiSharedData((d) => {
          d.aiFirstMsg = ''
        })
      })
    } else {
      setMsg()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = () => {
    handleSubmit(undefined, { data: { conversationId } })
  }

  return (
    <div className="flex flex-col h-screen">
      <LayoutHeader></LayoutHeader>

      <MessageList isLoading={isLoading}></MessageList>

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
