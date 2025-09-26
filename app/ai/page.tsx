'use client'

import { useState } from 'react'
import { LayoutHeader } from './components/layout/header'
import { useRouter } from 'next/navigation'
import { useAiStore } from './store/aiStore'
import { AiPromptInput } from './components/ai-prompt-input'
import { type PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { generateUUID } from '@/lib/utils'
import { createAiConversation } from '@/app/actions'

const models = [{ id: 'deepseek-chat', name: 'deepseek-chat' }]

export default function AIChatPage() {
  const setAiFirstMsg = useAiStore((state) => state.setAiFirstMsg)
  const updateConversationList = useAiStore((state) => state.updateConversationList)

  const [text, setText] = useState('')
  const [model, setModel] = useState<string>(models[0].id)
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false)

  const router = useRouter()

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    const conversationId = generateUUID(false)

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
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white/10">
      <LayoutHeader></LayoutHeader>

      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-4xl font-bold mb-10 text-center">有什么可以帮忙的？</div>

        <div className="flex justify-center p-2 md:w-8/12 mx-auto">
          <AiPromptInput
            onSubmit={handleSubmit}
            text={text}
            setText={setText}
            model={model}
            setModel={setModel}
            useWebSearch={useWebSearch}
            setUseWebSearch={setUseWebSearch}
            models={models}
            className="w-full"
            placeholder="询问任何问题？"
          />
        </div>
      </div>
    </div>
  )
}
