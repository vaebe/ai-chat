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
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools
} from '@/components/ai-elements/prompt-input'
import { GlobeIcon } from 'lucide-react'
import type { ChatStatus } from 'ai'

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

export function AiPromptInput({
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
}: AiPromptInputProps) {
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    onSubmit(message)
  }

  return (
    <PromptInput onSubmit={handleSubmit} className={className} globalDrop multiple>
      <PromptInputBody>
        <PromptInputAttachments>
          {(attachment) => <PromptInputAttachment data={attachment} />}
        </PromptInputAttachments>
        <PromptInputTextarea
          onChange={(e) => setText(e.target.value)}
          value={text}
          placeholder={placeholder}
        />
      </PromptInputBody>
      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <PromptInputButton
            onClick={() => setUseWebSearch(!useWebSearch)}
            variant={useWebSearch ? 'default' : 'ghost'}
          >
            <GlobeIcon size={16} />
            <span>搜索</span>
          </PromptInputButton>
          <PromptInputModelSelect
            onValueChange={(value) => {
              setModel(value)
            }}
            value={model}
          >
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              {models.map((model) => (
                <PromptInputModelSelectItem key={model.id} value={model.id}>
                  {model.name}
                </PromptInputModelSelectItem>
              ))}
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </PromptInputTools>

        <PromptInputSubmit disabled={disabled || !text} status={status} onClick={onStop} />
      </PromptInputToolbar>
    </PromptInput>
  )
}
