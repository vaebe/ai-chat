'use client'

import { cn } from '@/lib/utils'
import { LayoutSidebar } from './components/layout/sidebar'
import { useUIStore } from './store/ui-store'

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const layoutSidebar = useUIStore((state) => state.layoutSidebar)

  return (
    <div className={cn('flex h-screen')}>
      {layoutSidebar && <LayoutSidebar />}

      <div className="flex-1 flex flex-col bg-white dark:bg-[#212121]">{children}</div>
    </div>
  )
}
