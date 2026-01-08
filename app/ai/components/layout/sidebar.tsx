import { SidebarToggleIcon } from '@/app/ai/components/icon/sidebar-toggle'
import { NewChat } from '@/app/ai/components/icon/new-chat'
import { ConversationList } from './conversation-list'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useUIStore } from '@/app/ai/store/ui-store'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserButton } from '@clerk/nextjs'
import { ThemeSwitch } from '@/components/theme-switch'

function LayoutSidebar() {
  const { theme } = useTheme()
  const showSidebar = useUIStore((state) => state.showSidebar)

  return (
    <div className={cn('border-r bg-white dark:bg-black p-2 flex flex-col gap-2', showSidebar ? 'w-64' : 'w-14')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center pl-1">
          <Image src={theme === 'dark' ? '/logo/light.svg' : '/logo/dark.svg'} alt="logo" width={34} height={34} />
          {showSidebar && <div className="text-2xl font-bold ml-2">Chat</div>}
        </div>

        {showSidebar && <SidebarToggleIcon />}
      </div>

      {/* 侧边栏收起默认渲染一个 icon */}
      {!showSidebar && <SidebarToggleIcon />}

      <NewChat />

      <ScrollArea className="flex-1 pt-2">{showSidebar && <ConversationList />}</ScrollArea>

      <div className="flex items-center justify-between">
        <UserButton />
        {showSidebar && <ThemeSwitch></ThemeSwitch>}
      </div>
    </div>
  )
}

export { LayoutSidebar }
export default LayoutSidebar
