'use client'

import { cn } from '@/lib/utils'
import { LayoutSidebar } from './components/layout/sidebar'

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn('flex h-screen')}>
      <LayoutSidebar />

      <div className="flex-1 flex flex-col bg-white dark:bg-[#212121]">{children}</div>
    </div>
  )
}
