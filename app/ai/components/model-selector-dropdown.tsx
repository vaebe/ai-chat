'use client'

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
import { CheckIcon } from 'lucide-react'
import type { GatewayLanguageModelEntry } from '@ai-sdk/gateway'
import { useState } from 'react'
import { useInputStore } from '@/app/ai/store/input-store'

interface ModelSelectorDropdownProps {
  className?: string
  placeholder?: string
}

export const ModelSelectorDropdown = ({ className, placeholder = '选择模型' }: ModelSelectorDropdownProps) => {
  const [open, setOpen] = useState(false)

  const selectedModel = useInputStore((state) => state.selectedModel)
  const models = useInputStore((state) => state.models)
  const setSelectedModel = useInputStore((state) => state.setSelectedModel)

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    setOpen(false)
  }

  const selectedModelData = models.find((m) => m.id === selectedModel)
  const selectedModelName = selectedModelData?.name || placeholder
  const selectedModelProvider = selectedModelData?.specification?.provider || ''

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
  )
}
