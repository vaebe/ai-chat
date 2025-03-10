import { OpenOrCloseSiderbarIcon } from './OpenOrCloseSiderbarIcon'
import { NewChatIcon } from './NewChatIcon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react'
import { AiSharedDataContext } from './AiSharedDataContext'
import { useContext } from 'react'

function LayoutHeader() {
  const title = `AI Chat`

  const { data: session, status } = useSession()

  const { aiSharedData } = useContext(AiSharedDataContext)

  return (
    <div className="w-full flex items-center justify-between pt-2 px-8">
      <div className="flex items-center">
        {/* 用户已经登录且侧边栏未打开 */}
        {status === 'authenticated' && !aiSharedData.layoutSidebar && (
          <div>
            <OpenOrCloseSiderbarIcon state={true}></OpenOrCloseSiderbarIcon>
            <NewChatIcon></NewChatIcon>
          </div>
        )}

        <h1 className="text-2xl font-bold ml-2">{title}</h1>
      </div>

      <div>
        {status === 'unauthenticated' && (
          <div className="flex items-center cursor-pointer space-x-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 shadow-sm hover:shadow-md">
            <Icon icon="ri:aed-line" className="mr-2 w-5 h-5" />
            登录
          </div>
        )}

        {status === 'authenticated' && (
          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarImage src={session?.user?.image ?? ''} alt="user" />
              <AvatarFallback>{session?.user?.name ?? 'll'}</AvatarFallback>
            </Avatar>

            <span>{session?.user?.name ?? 'll'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export { LayoutHeader }
export default LayoutHeader
