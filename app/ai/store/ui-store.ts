import { create } from 'zustand'
import { UIState, UIActions } from '@/types/ai'

const defaultState: UIState = {
  showSidebar: true,
  messagesLoading: false
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  ...defaultState,

  setShowSidebar: (showSidebar: boolean) => set({ showSidebar }),

  setMessagesLoading: (messagesLoading: boolean) => set({ messagesLoading }),

  resetUIState: () => set(defaultState)
}))
