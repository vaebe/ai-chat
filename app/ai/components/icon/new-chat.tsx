import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/react'
import { useRouter, usePathname } from 'next/navigation'
import * as React from 'react'
import { useUIStore } from '@/app/ai/store/ui-store'

function NewChat({ className }: React.ComponentProps<'div'>) {
  const showSidebar = useUIStore((state) => state.showSidebar)

  const router = useRouter()
  const pathname = usePathname()

  function newChat() {
    if (pathname === '/ai') {
      return
    }

    router.replace('/ai')
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={showSidebar ? 'default' : 'icon'}
            onClick={newChat}
            className={cn('cursor-pointer', className)}
          >
            <Icon icon="hugeicons:pencil-edit-02" className="h-6 w-6"></Icon>
            {showSidebar && <span>开启新对话</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>开启新对话</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { NewChat }
export default NewChat
