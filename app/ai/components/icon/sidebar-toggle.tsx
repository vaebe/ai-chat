import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@iconify/react'
import { AiSharedDataContext } from '@/app/ai/components/AiSharedDataContext'
import { useContext } from 'react'

function SidebarToggleIcon({ state }: { state: boolean }) {
  const { setAiSharedData } = useContext(AiSharedDataContext)

  function handleClick() {
    setAiSharedData((d) => {
      d.layoutSidebar = state
    })
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
          <p>{state ? '打开侧边栏' : '关闭侧边栏'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { SidebarToggleIcon }
export default SidebarToggleIcon
