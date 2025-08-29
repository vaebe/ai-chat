'use client'

import { cn } from '@/lib/utils'
import { LayoutSidebar } from './components/layout/sidebar'
import { AiSharedDataContext, defaultAiSharedData } from './components/AiSharedDataContext'
import type { AiSharedData } from './components/AiSharedDataContext'
import { useImmer } from 'use-immer'

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const [aiSharedData, setAiSharedData] = useImmer<AiSharedData>(
    JSON.parse(JSON.stringify(defaultAiSharedData.aiSharedData))
  )

  return (
    <AiSharedDataContext.Provider value={{ aiSharedData, setAiSharedData }}>
      <div className={cn('flex h-screen')}>
        {aiSharedData.layoutSidebar && <LayoutSidebar />}

        <div className="flex-1 flex flex-col bg-white dark:bg-[#212121]">{children}</div>
      </div>
    </AiSharedDataContext.Provider>
  )
}
