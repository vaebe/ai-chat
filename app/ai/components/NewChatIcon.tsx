import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/react'
import { useRouter, usePathname } from 'next/navigation'
import * as React from 'react'

function NewChatIcon({ className }: React.ComponentProps<'div'>) {
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
            size="icon"
            onClick={newChat}
            className={cn('cursor-pointer', className)}
          >
            <Icon icon="hugeicons:pencil-edit-02" className="h-6 w-6"></Icon>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>新聊天</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { NewChatIcon }
export default NewChatIcon
