'use client'

import { useState, useContext } from 'react'
import { LayoutHeader } from './components/layout/header'
import { useRouter } from 'next/navigation'
import { AiSharedDataContext } from './components/AiSharedDataContext'
import { Sender } from '@/app/ai/components/sender'
import { generateUUID } from '@/lib/utils'
import { createAiConversation } from '@/app/actions'

export default function AIChatPage() {
  const { setAiSharedData } = useContext(AiSharedDataContext)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const onSubmit = () => {
    if (isLoading) {
      return
    }

    setIsLoading(true)

    const conversationId = generateUUID(false)

    createAiConversation({ name: 'New Chat', uid: conversationId })

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
        <div className="text-4xl font-bold mb-10 text-center">有什么可以帮忙的？</div>

        <div className="flex justify-center p-2 md:w-8/12 mx-auto">
          <Sender onSubmit={onSubmit} input={input} setInput={setInput}></Sender>
        </div>
      </div>
    </div>
  )
}
