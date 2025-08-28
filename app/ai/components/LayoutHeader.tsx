import { OpenOrCloseSiderbarIcon } from './OpenOrCloseSiderbarIcon'
import { NewChatIcon } from './NewChatIcon'
import { AiSharedDataContext } from './AiSharedDataContext'
import { useContext } from 'react'
import { UserButton } from '@clerk/nextjs'
import { ThemeSwitch } from '@/components/theme-switch'

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

      <div className="flex items-center space-x-4">
        <ThemeSwitch></ThemeSwitch>
        <UserButton />
      </div>
    </div>
  )
}

export { LayoutHeader }
export default LayoutHeader
