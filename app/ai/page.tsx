'use client'

import { LayoutHeader } from './components/layout/header'
import { useRouter } from 'next/navigation'
import { useAiStore } from './store/ai-store'
import { useInputStore } from './store/input-store'
import { AiPromptInput } from './components/prompt-input'
import { type PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { nanoid } from 'nanoid'
import { createAiConversation } from '@/app/actions'

export default function AIChatPage() {
  const setAiFirstMsg = useAiStore((state) => state.setAiFirstMsg)
  const updateConversationList = useAiStore((state) => state.updateConversationList)

  // 从输入 store 获取输入框状态（直接订阅，确保变更触发重渲染）
  const inputText = useInputStore((state) => state.inputText)
  const selectedModel = useInputStore((state) => state.selectedModel)
  const useWebSearch = useInputStore((state) => state.useWebSearch)
  const models = useInputStore((state) => state.models)

  // 输入相关方法
  const setInputText = useInputStore((state) => state.setInputText)
  const setSelectedModel = useInputStore((state) => state.setSelectedModel)
  const setUseWebSearch = useInputStore((state) => state.setUseWebSearch)

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
      <LayoutHeader></LayoutHeader>

      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-4xl font-bold mb-10 text-center">有什么可以帮忙的？</div>

        <div className="flex justify-center p-2 md:w-8/12 mx-auto">
          <AiPromptInput
            onSubmit={handleSubmit}
            text={inputText}
            setText={setInputText}
            model={selectedModel}
            setModel={setSelectedModel}
            useWebSearch={useWebSearch}
            setUseWebSearch={setUseWebSearch}
            models={models}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
