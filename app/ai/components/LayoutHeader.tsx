import { OpenOrCloseSiderbarIcon } from './OpenOrCloseSiderbarIcon'
import { NewChatIcon } from './NewChatIcon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession, signOut } from 'next-auth/react'
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
  const { data: session } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarImage src={session?.user?.image ?? ''} alt="user" />
            <AvatarFallback>{session?.user?.name ?? 'll'}</AvatarFallback>
          </Avatar>

          <span>{session?.user?.name ?? 'll'}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ redirectTo: '/login' })}
        >
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
        {/* 用户已经登录且侧边栏未打开 */}
        {!aiSharedData.layoutSidebar && (
          <div>
            <OpenOrCloseSiderbarIcon state={true}></OpenOrCloseSiderbarIcon>
            <NewChatIcon></NewChatIcon>
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
