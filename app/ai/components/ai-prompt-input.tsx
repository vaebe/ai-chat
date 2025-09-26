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
import React, { useCallback, useMemo } from 'react'

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

export const AiPromptInput = React.memo<AiPromptInputProps>(
  ({
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
  }) => {
    const handleSubmit = useCallback(
      (message: PromptInputMessage) => {
        const hasText = Boolean(message.text)
        const hasAttachments = Boolean(message.files?.length)

        if (!(hasText || hasAttachments)) {
          return
        }

        onSubmit(message)
      },
      [onSubmit]
    )

    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
      },
      [setText]
    )

    const handleModelChange = useCallback(
      (value: string) => {
        setModel(value)
      },
      [setModel]
    )

    const handleWebSearchToggle = useCallback(() => {
      setUseWebSearch(!useWebSearch)
    }, [useWebSearch, setUseWebSearch])

    const modelOptions = useMemo(() => {
      return models.map((model) => (
        <PromptInputModelSelectItem key={model.id} value={model.id}>
          {model.name}
        </PromptInputModelSelectItem>
      ))
    }, [models])

    return (
      <PromptInput onSubmit={handleSubmit} className={className} globalDrop multiple>
        <PromptInputBody>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea onChange={handleTextChange} value={text} placeholder={placeholder} />
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
              onClick={handleWebSearchToggle}
              variant={useWebSearch ? 'default' : 'ghost'}
            >
              <GlobeIcon size={16} />
              <span>搜索</span>
            </PromptInputButton>
            <PromptInputModelSelect onValueChange={handleModelChange} value={model}>
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>{modelOptions}</PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>

          <PromptInputSubmit disabled={disabled || !text} status={status} onClick={onStop} />
        </PromptInputToolbar>
      </PromptInput>
    )
  }
)

AiPromptInput.displayName = 'AiPromptInput'
