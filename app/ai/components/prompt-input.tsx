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
import type { ChatStatus } from 'ai'
import type { GatewayLanguageModelEntry } from '@ai-sdk/gateway'
import React, { useState } from 'react'

interface AiPromptInputProps {
  onSubmit: (message: PromptInputMessage) => void
  text: string
  setText: (text: string) => void
  model: string
  setModel: (model: string) => void
  useWebSearch: boolean
  setUseWebSearch: (useWebSearch: boolean) => void
  models: GatewayLanguageModelEntry[]
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
  const [open, setOpen] = useState(false)

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

  const handleModelChange = (modelId: string) => {
    setModel(modelId)
    setOpen(false)
  }

  const handleWebSearchToggle = () => {
    setUseWebSearch(!useWebSearch)
  }

  const selectedModelData = models.find((m) => m.id === model)
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

  // 品牌显示名称映射
  const brandNames: Record<string, string> = {
    alibaba: 'Alibaba',
    anthropic: 'Anthropic',
    deepseek: 'DeepSeek',
    google: 'Google',
    openai: 'OpenAI',
    mistral: 'Mistral',
    llama: 'Meta'
  }

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
                  <ModelSelectorGroup key={brand} heading={brandNames[brand] || brand}>
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
                        {model === modelItem.id ? (
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

        <PromptInputSubmit disabled={disabled || !text} status={status} onClick={onStop} />
      </PromptInputFooter>
    </PromptInput>
  )
}
