'use client'

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputFooter
} from '@/components/ai-elements/prompt-input'
import { GlobeIcon } from 'lucide-react'
import type { ChatStatus } from 'ai'
import React from 'react'

interface AiPromptInputProps {
  onSubmit: (message: PromptInputMessage) => void
  text: string
  setText: (text: string) => void
  model: string
  setModel: (model: string) => void
  useWebSearch: boolean
  setUseWebSearch: (useWebSearch: boolean) => void
  models: Array<{ id: string; name: string }>
  disabled?: boolean
  status?: ChatStatus
  onStop?: () => void
  className?: string
  placeholder?: string
}

export const AiPromptInput = ({
  onSubmit,
  text,
  setText,
  model,
  setModel,
  useWebSearch,
  setUseWebSearch,
  models,
  disabled = false,
  status,
  onStop,
  className,
  placeholder = '询问任何问题？'
}: AiPromptInputProps) => {
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    onSubmit(message)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleModelChange = (value: string) => {
    setModel(value)
  }

  const handleWebSearchToggle = () => {
    setUseWebSearch(!useWebSearch)
  }

  const modelOptions = models.map((model) => (
    <PromptInputSelectItem key={model.id} value={model.id}>
      {model.name}
    </PromptInputSelectItem>
  ))

  return (
    <PromptInput onSubmit={handleSubmit} className={className} globalDrop multiple>
      <PromptInputBody>
        <PromptInputAttachments>{(attachment) => <PromptInputAttachment data={attachment} />}</PromptInputAttachments>
        <PromptInputTextarea onChange={handleTextChange} value={text} placeholder={placeholder} />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <PromptInputButton
            className="cursor-pointer"
            onClick={handleWebSearchToggle}
            variant={useWebSearch ? 'default' : 'ghost'}
          >
            <GlobeIcon size={16} />
            <span>搜索</span>
          </PromptInputButton>
          <PromptInputSelect onValueChange={handleModelChange} value={model}>
            <PromptInputSelectTrigger>
              <PromptInputSelectValue />
            </PromptInputSelectTrigger>
            <PromptInputSelectContent>{modelOptions}</PromptInputSelectContent>
          </PromptInputSelect>
        </PromptInputTools>

        <PromptInputSubmit disabled={disabled || !text} status={status} onClick={onStop} />
      </PromptInputFooter>
    </PromptInput>
  )
}
