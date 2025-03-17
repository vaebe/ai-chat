'use client'

import { useState, useContext } from 'react'
import { LayoutHeader } from './components/LayoutHeader'
import { useRouter } from 'next/navigation'
import { AiSharedDataContext } from './components/AiSharedDataContext'
import { StartAConversationPrompt } from './components/StartAConversationPrompt'
import { Sender } from './components/Sender'
import { generateUUID } from '@/lib/utils'

export default function AIChatPage() {
  const { setAiSharedData } = useContext(AiSharedDataContext)

  const [input, setInput] = useState('')

  const router = useRouter()

  function createConversation(uid: string) {
    fetch('/api/ai/conversation/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'New Chat', uid })
    })
  }

  const onSubmit = () => {
    if (!input.trim()) {
      return
    }

    const conversationId = generateUUID(false)

    // todo 立即生成本地对话 ID 需要发送请求的时候如何不被用户修改
    createConversation(conversationId)

    setAiSharedData((d) => {
      d.aiFirstMsg = input
      d.conversationList = [
        {
          desc: '',
          id: conversationId,
          name: 'New Chat',
          userId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        ...d.conversationList
      ]
    })

    router.replace(`/ai/${conversationId}`)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white/10">
      <LayoutHeader></LayoutHeader>

      <div className="w-full h-full flex flex-col items-center justify-center">
        <StartAConversationPrompt chatStarted={false}></StartAConversationPrompt>

        <div className="flex justify-center p-2 md:w-8/12 mx-auto">
          <Sender onSubmit={onSubmit} input={input} setInput={setInput}></Sender>
        </div>
      </div>
    </div>
  )
}
