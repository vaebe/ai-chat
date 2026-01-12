import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { InputState, InputActions } from '@/types/ai'
import { type GatewayLanguageModelEntry } from '@ai-sdk/gateway'

const DefaultModels: GatewayLanguageModelEntry = {
  id: 'deepseek/deepseek-v3.2',
  name: 'DeepSeek V3.2',
  description: 'DeepSeek-V3.2: Official successor to V3.2-Exp.',
  pricing: {
    input: '0.00000027',
    output: '0.0000004',
    cachedInputTokens: '0.000000216'
  },
  specification: {
    specificationVersion: 'v3',
    provider: 'deepinfra',
    modelId: 'deepseek/deepseek-v3.2'
  },
  modelType: 'language'
}

const defaultState: InputState = {
  inputText: '',
  selectedModel: 'deepseek/deepseek-v3.2',
  useWebSearch: false,
  models: [DefaultModels]
}

export const useInputStore = create<InputState & InputActions>()(
  persist(
    (set) => ({
      ...defaultState,

      setInputText: (inputText: string) => set({ inputText }),

      setSelectedModel: (selectedModel: string) => set({ selectedModel }),

      setUseWebSearch: (useWebSearch: boolean) => set({ useWebSearch }),

      setModels: (models: GatewayLanguageModelEntry[]) => set({ models }),

      resetInputState: () => set(defaultState)
    }),
    {
      name: 'ai-input-store',
      partialize: (state) => ({ selectedModel: state.selectedModel })
    }
  )
)
