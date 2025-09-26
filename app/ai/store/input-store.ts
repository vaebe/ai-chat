import { create } from 'zustand'
import { InputState, InputActions, ModelOption } from '@/types/ai'

const defaultState: InputState = {
  inputText: '',
  selectedModel: 'deepseek-chat',
  useWebSearch: false,
  models: [{ id: 'deepseek-chat', name: 'deepseek-chat' }] as ModelOption[]
}

export const useInputStore = create<InputState & InputActions>((set) => ({
  ...defaultState,

  setInputText: (inputText: string) => set({ inputText }),

  setSelectedModel: (selectedModel: string) => set({ selectedModel }),

  setUseWebSearch: (useWebSearch: boolean) => set({ useWebSearch }),

  setModels: (models: Array<{ id: string; name: string }>) => set({ models }),

  resetInputState: () => set(defaultState)
}))
