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
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputFooter
} from '@/components/ai-elements/prompt-input'
import { ModelSelectorDropdown } from './model-selector-dropdown'
import { GlobeIcon } from 'lucide-react'
import { type ChangeEvent } from 'react'
import { useInputStore } from '@/app/ai/store/input-store'

interface StandaloneMessageInputProps {
  onSubmit: (message: PromptInputMessage) => void
  className?: string
  placeholder?: string
}

export const StandaloneMessageInput = ({
  onSubmit,
  className,
  placeholder = '询问任何问题？'
}: StandaloneMessageInputProps) => {
  const inputText = useInputStore((state) => state.inputText)
  const useWebSearch = useInputStore((state) => state.useWebSearch)
  const setInputText = useInputStore((state) => state.setInputText)
  const setUseWebSearch = useInputStore((state) => state.setUseWebSearch)

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    onSubmit(message)
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleWebSearchToggle = () => {
    setUseWebSearch(!useWebSearch)
  }

  return (
    <PromptInput onSubmit={handleSubmit} className={className} globalDrop multiple>
      <PromptInputBody>
        <PromptInputAttachments>{(attachment) => <PromptInputAttachment data={attachment} />}</PromptInputAttachments>
        <PromptInputTextarea onChange={handleTextChange} value={inputText} placeholder={placeholder} />
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

          <ModelSelectorDropdown />
        </PromptInputTools>

        <PromptInputSubmit disabled={!inputText.trim()} />
      </PromptInputFooter>
    </PromptInput>
  )
}
