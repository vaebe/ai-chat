import { ScrollArea } from '@/components/ui/scroll-area'
import { OpenOrCloseSiderbarIcon } from './OpenOrCloseSiderbarIcon'
import { NewChatIcon } from './NewChatIcon'
import { AiSharedDataContext } from './AiSharedDataContext'
import { useContext, useEffect, useState } from 'react'
import { getAiConversationList } from '@/app/actions'
import { useParams, useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/react'
import { AiConversation } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { removeAiConversation, updateAiConversation } from '@/app/actions'

interface UseShowHideRes {
  hide: () => void
  show: () => void
  toggle: (nextVisible?: boolean) => void
  visible: boolean
}

export function useShowHide(defaultVisible = false) {
  const [visible, setVisible] = useState(defaultVisible)

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  const toggle = (nextVisible?: boolean) => {
    if (typeof nextVisible !== 'undefined') {
      setVisible(nextVisible)
    } else {
      setVisible((previousVisible) => !previousVisible)
    }
  }

  return { hide, show, toggle, visible }
}

interface OperateDialogProps {
  info: AiConversation
  dialog: UseShowHideRes
}

function RemoveConversation({ info, dialog }: OperateDialogProps) {
  const { setAiSharedData, aiSharedData } = useContext(AiSharedDataContext)

  const { id } = useParams()
  const router = useRouter()

  async function remove() {
    removeAiConversation(info.id).then((res) => {
      if (res.code === 0) {
        setAiSharedData((d) => {
          d.conversationList = aiSharedData.conversationList.filter((item) => item.id !== info.id)
        })
      }
    })

    dialog.hide()

    if (info.id === id) {
      router.push(`/ai`)
    }
  }

  return (
    <Dialog onOpenChange={dialog.toggle} open={dialog.visible}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除聊天</DialogTitle>
          <DialogDescription>这会删除 “{info.name}”。</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="cursor-pointer"
            onClick={dialog.hide}
          >
            取消
          </Button>

          <Button onClick={remove} className="cursor-pointer">
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditConversationName({ info, dialog }: OperateDialogProps) {
  const { setAiSharedData, aiSharedData } = useContext(AiSharedDataContext)

  const [name, setName] = useState(info.name)

  async function save() {
    updateAiConversation({ id: info.id, name }).then((res) => {
      if (res.code === 0) {
        dialog.hide()

        setAiSharedData((d) => {
          d.conversationList = aiSharedData.conversationList.map((item) => {
            return item.id === info.id ? { ...item, name } : item
          })
        })
      }
    })
  }

  return (
    <Dialog onOpenChange={dialog.toggle} open={dialog.visible}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑对话名称</DialogTitle>
        </DialogHeader>

        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />

        <DialogFooter>
          <Button
            className="cursor-pointer"
            type="button"
            variant="secondary"
            onClick={dialog.hide}
          >
            取消
          </Button>

          <Button className="cursor-pointer" onClick={save}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Operate({ info }: { info: AiConversation }) {
  const deleteDialog = useShowHide()
  const editDialog = useShowHide()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Icon icon="dashicons:ellipsis" className="w-[20px] cursor-pointer"></Icon>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem className="cursor-pointer" onSelect={editDialog.show}>
            <div className="flex items-center">
              <Icon icon="lucide:edit" className="w-5 h-5 mx-2" />
              <span>重命名</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer" onSelect={deleteDialog.show}>
            <div className="flex items-center">
              <Icon icon="fluent:delete-12-regular" className="w-5 h-5 mx-2" />
              <span>删除</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RemoveConversation info={info} dialog={deleteDialog}></RemoveConversation>

      <EditConversationName info={info} dialog={editDialog}></EditConversationName>
    </>
  )
}

function ChatListItem({ item }: { item: AiConversation }) {
  const { id } = useParams()
  const router = useRouter()
  function switchConversation(curId: string) {
    if (id === curId) {
      return
    }

    router.push(`/ai/${curId}`)
  }

  return (
    <div
      className={`flex items-center justify-between px-2 py-1 text-14 cursor-pointer rounded-lg dark:text-white  hover:bg-black/10 dark:hover:bg-white/10 ${id === item.id ? 'bg-black/10 dark:bg-white/10' : ''}`}
      style={{ boxSizing: 'border-box' }}
    >
      <p
        className="overflow-hidden whitespace-nowrap"
        style={{ width: `calc(100% - 30px)` }}
        onClick={() => switchConversation(item.id)}
      >
        {item.name}
      </p>
      <Operate info={item}></Operate>
    </div>
  )
}

function ChatList() {
  const { setAiSharedData, aiSharedData } = useContext(AiSharedDataContext)

  useEffect(() => {
    getAiConversationList().then((res) => {
      const list = res.code === 0 ? res.data?.list || [] : []

      setAiSharedData((d) => {
        d.conversationList = list
      })
    })
  }, [setAiSharedData])

  return (
    <ScrollArea className="h-[92vh]">
      <div className="w-64 p-2 space-y-1">
        {aiSharedData.conversationList.map((item) => (
          <ChatListItem item={item} key={item.id}></ChatListItem>
        ))}
      </div>
    </ScrollArea>
  )
}

function LayoutSidebar() {
  return (
    <div className="w-64 border-r bg-background">
      <div className="p-2 flex justify-between">
        <OpenOrCloseSiderbarIcon state={false}></OpenOrCloseSiderbarIcon>
        <NewChatIcon></NewChatIcon>
      </div>

      <ChatList></ChatList>
    </div>
  )
}

export { LayoutSidebar }
export default LayoutSidebar
