import { useCallback, useRef } from 'react'

export function useChatScroll() {
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    })
  }, [])

  return { containerRef, scrollToBottom }
}
