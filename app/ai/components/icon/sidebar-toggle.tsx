import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@iconify/react'
import { useUIStore } from '@/app/ai/store/ui-store'

function SidebarToggleIcon() {
  const showSidebar = useUIStore((state) => state.showSidebar)
  const setShowSidebar = useUIStore((state) => state.setShowSidebar)

  function handleClick() {
    setShowSidebar(!showSidebar)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="cursor-pointer" onClick={handleClick}>
            <Icon icon="solar:siderbar-linear" className="h-6 w-6 cursor-pointer"></Icon>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showSidebar ? '关闭侧边栏' : '打开侧边栏'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { SidebarToggleIcon }
export default SidebarToggleIcon
