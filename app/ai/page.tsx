'use client'

import { useRouter } from 'next/navigation'
import { useConversationStore } from './store/conversation-store'
import { useInputStore } from './store/input-store'
import { AiPromptInput } from './components/prompt-input'
import { type PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { nanoid } from 'nanoid'
import { createAiConversation } from '@/app/actions'
import { getAiGatewayModels } from '@/lib/utils'
import { useEffect } from 'react'

export default function AIChatPage() {
  const setAiFirstMsg = useConversationStore((state) => state.setAiFirstMsg)
  const updateConversationList = useConversationStore((state) => state.updateConversationList)

  const setModels = useInputStore((state) => state.setModels)
  const setInputText = useInputStore((state) => state.setInputText)

  useEffect(() => {
    getAiGatewayModels().then((models) => {
      setModels(models)
    })
  }, [])

  const router = useRouter()

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    const conversationId = nanoid()

    createAiConversation({ name: 'New Chat', uid: conversationId })

    setAiFirstMsg(message.text || 'Sent with attachments')
    updateConversationList((list) => [
      {
        desc: '',
        id: conversationId,
        name: 'New Chat',
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      },
      ...list
    ])

    router.replace(`/ai/${conversationId}`)

    // 清空输入框
    setInputText('')
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white/10">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-3xl font-bold mb-10 text-center">有什么可以帮忙的？</div>

        <div className="flex justify-center p-2 md:w-8/12 mx-auto">
          <AiPromptInput onSubmit={handleSubmit} className="w-full" />
        </div>
      </div>
    </div>
  )
}
