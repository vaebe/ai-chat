import { SidebarToggleIcon } from '@/app/ai/components/icon/sidebar-toggle'
import { NewChatIcon } from '@/app/ai/components/icon/new-chat'
import { useAiStore } from '@/app/ai/store/aiStore'
import { UserButton } from '@clerk/nextjs'
import { ThemeSwitch } from '@/components/theme-switch'

function LayoutHeader() {
  const title = `AI Chat`

  const layoutSidebar = useAiStore((state) => state.layoutSidebar)

  return (
    <div className="w-full flex items-center justify-between py-2 pl-2 pr-8">
      <div className="flex items-center">
        {!layoutSidebar && (
          <div>
            <SidebarToggleIcon state={true}></SidebarToggleIcon>
            <NewChatIcon className="ml-4"></NewChatIcon>
          </div>
        )}

        <h1 className="text-2xl font-bold ml-2">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeSwitch></ThemeSwitch>
        <UserButton />
      </div>
    </div>
  )
}

export { LayoutHeader }
export default LayoutHeader
