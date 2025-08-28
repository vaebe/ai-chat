import { OpenOrCloseSiderbarIcon } from './OpenOrCloseSiderbarIcon'
import { NewChatIcon } from './NewChatIcon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth, useUser } from '@clerk/nextjs'
import { Icon } from '@iconify/react'
import { AiSharedDataContext } from './AiSharedDataContext'
import { useContext } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

function UserAvatar() {
  const { user } = useUser()
  const { signOut } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer">
          <Avatar className="w-8 h-8">
            {user?.imageUrl ? (
              <AvatarImage src={user?.imageUrl} alt="user" />
            ) : (
              <AvatarFallback>{user?.username ?? 'ai'}</AvatarFallback>
            )}
          </Avatar>

          <span>{user?.username ?? 'ai'}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user?.primaryEmailAddress?.emailAddress ?? ''}</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({ redirectUrl: '/' })}>
          <div className="flex items-center">
            <Icon icon="lucide:log-out" className="w-5 h-5 mx-2" />
            <span>退出登录</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LayoutHeader() {
  const title = `AI Chat`

  const { aiSharedData } = useContext(AiSharedDataContext)

  return (
    <div className="w-full flex items-center justify-between py-2 pl-2 pr-8">
      <div className="flex items-center">
        {!aiSharedData.layoutSidebar && (
          <div>
            <OpenOrCloseSiderbarIcon state={true}></OpenOrCloseSiderbarIcon>
            <NewChatIcon className="ml-4"></NewChatIcon>
          </div>
        )}

        <h1 className="text-2xl font-bold ml-2">{title}</h1>
      </div>

      <div>
        <UserAvatar></UserAvatar>
      </div>
    </div>
  )
}

export { LayoutHeader }
export default LayoutHeader
