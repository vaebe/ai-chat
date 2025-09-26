import { create } from 'zustand'
import { UIState, UIActions } from '@/types/ai'

const defaultState: UIState = {
  layoutSidebar: true,
  messagesLoading: false
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  ...defaultState,

  setLayoutSidebar: (layoutSidebar: boolean) => set({ layoutSidebar }),

  setMessagesLoading: (messagesLoading: boolean) => set({ messagesLoading }),

  resetUIState: () => set(defaultState)
}))
