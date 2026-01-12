'use client'

import { useChatContext } from '@/app/ai/context/chat-context'
import { useChat } from '@ai-sdk/react'
import { useInputStore } from '@/app/ai/store/input-store'
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
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger
} from '@/components/ai-elements/model-selector'
import { Button } from '@/components/ui/button'
import { CheckIcon, GlobeIcon } from 'lucide-react'
import type { GatewayLanguageModelEntry } from '@ai-sdk/gateway'
import { useState } from 'react'

interface ChatPromptInputProps {
  className?: string
  placeholder?: string
}

export function ChatPromptInput({ className, placeholder = '询问任何问题？' }: ChatPromptInputProps) {
  const { chat } = useChatContext()
  const { status, stop, sendMessage } = useChat({ chat })

  // 从 store 获取输入状态
  const inputText = useInputStore((state) => state.inputText)
  const selectedModel = useInputStore((state) => state.selectedModel)
  const useWebSearch = useInputStore((state) => state.useWebSearch)
  const models = useInputStore((state) => state.models)
  const setInputText = useInputStore((state) => state.setInputText)
  const setSelectedModel = useInputStore((state) => state.setSelectedModel)
  const setUseWebSearch = useInputStore((state) => state.setUseWebSearch)

  const [open, setOpen] = useState(false)

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    sendMessage({
      text: message.text || 'Sent with attachments',
      files: message.files
    })
    setInputText('')
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    setOpen(false)
  }

  const handleWebSearchToggle = () => {
    setUseWebSearch(!useWebSearch)
  }

  const selectedModelData = models.find((m) => m.id === selectedModel)
  const selectedModelName = selectedModelData?.name || '选择模型'
  const selectedModelProvider = selectedModelData?.specification?.provider || ''

  // 按品牌分组模型
  const groupedModels = models.reduce(
    (acc, modelItem) => {
      const brand = modelItem.specification?.provider || 'other'
      if (!acc[brand]) {
        acc[brand] = []
      }
      acc[brand].push(modelItem)
      return acc
    },
    {} as Record<string, GatewayLanguageModelEntry[]>
  )

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

          <ModelSelector open={open} onOpenChange={setOpen}>
            <ModelSelectorTrigger asChild>
              <Button variant="outline" className="cursor-pointer justify-start h-9 min-w-40 gap-2" size="sm">
                {selectedModelProvider && <ModelSelectorLogo provider={selectedModelProvider} />}
                <ModelSelectorName className="truncate">{selectedModelName}</ModelSelectorName>
              </Button>
            </ModelSelectorTrigger>
            <ModelSelectorContent>
              <ModelSelectorInput placeholder="搜索模型..." />
              <ModelSelectorList>
                <ModelSelectorEmpty>没有找到模型</ModelSelectorEmpty>
                {Object.entries(groupedModels).map(([brand, brandModels]) => (
                  <ModelSelectorGroup key={brand} heading={brand}>
                    {brandModels.map((modelItem) => (
                      <ModelSelectorItem
                        key={modelItem.id}
                        value={modelItem.id}
                        onSelect={() => handleModelChange(modelItem.id)}
                      >
                        {modelItem.specification?.provider && (
                          <ModelSelectorLogo provider={modelItem.specification.provider} />
                        )}
                        <ModelSelectorName>{modelItem.name}</ModelSelectorName>
                        {(modelItem.specification as any)?.apiProvider && (
                          <ModelSelectorLogoGroup>
                            <ModelSelectorLogo provider={(modelItem.specification as any).apiProvider} />
                          </ModelSelectorLogoGroup>
                        )}
                        {selectedModel === modelItem.id ? (
                          <CheckIcon className="ml-auto size-4" />
                        ) : (
                          <div className="ml-auto size-4" />
                        )}
                      </ModelSelectorItem>
                    ))}
                  </ModelSelectorGroup>
                ))}
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>
        </PromptInputTools>

        <PromptInputSubmit disabled={!inputText} status={status} onClick={stop} />
      </PromptInputFooter>
    </PromptInput>
  )
}
