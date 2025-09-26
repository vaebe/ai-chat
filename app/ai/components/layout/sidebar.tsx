import { SidebarToggleIcon } from '@/app/ai/components/icon/sidebar-toggle'
import { NewChatIcon } from '@/app/ai/components/icon/new-chat'
import { ConversationList } from './conversation-list'

function LayoutSidebar() {
  return (
    <div className="w-64 border-r bg-white dark:bg-black">
      <div className="p-2 flex justify-between">
        <SidebarToggleIcon state={false} />
        <NewChatIcon />
      </div>
      <ConversationList />
    </div>
  )
}

export { LayoutSidebar }
export default LayoutSidebar
