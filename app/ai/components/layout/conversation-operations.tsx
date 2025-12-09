import React, { useState } from 'react'
import { AiConversation } from '@/generated/prisma/client'
import { useConversationOperations } from '../../hooks/use-conversation-operations'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/react'
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

interface ConversationOperationsProps {
  conversation: AiConversation
}

interface UseShowHideRes {
  hide: () => void
  show: () => void
  toggle: (nextVisible?: boolean) => void
  visible: boolean
}

function useShowHide(defaultVisible = false): UseShowHideRes {
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

function RemoveConversationDialog({
  conversation,
  dialog
}: {
  conversation: AiConversation
  dialog: UseShowHideRes
}) {
  const { removeConversation } = useConversationOperations()

  const handleRemove = async () => {
    await removeConversation(conversation)
    dialog.hide()
  }

  return (
    <Dialog onOpenChange={dialog.toggle} open={dialog.visible}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除聊天</DialogTitle>
          <DialogDescription>这会删除 &quot;{conversation.name}&quot;。</DialogDescription>
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
          <Button onClick={handleRemove} className="cursor-pointer">
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditConversationDialog({
  conversation,
  dialog
}: {
  conversation: AiConversation
  dialog: UseShowHideRes
}) {
  const { updateConversation } = useConversationOperations()
  const [name, setName] = useState(conversation.name)

  const handleSave = async () => {
    await updateConversation(conversation, name)
    dialog.hide()
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
          <Button className="cursor-pointer" onClick={handleSave}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const ConversationOperations = React.memo<ConversationOperationsProps>(
  ({ conversation }) => {
    const deleteDialog = useShowHide()
    const editDialog = useShowHide()

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Icon icon="dashicons:ellipsis" className="w-5 cursor-pointer" />
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

        <RemoveConversationDialog conversation={conversation} dialog={deleteDialog} />
        <EditConversationDialog conversation={conversation} dialog={editDialog} />
      </>
    )
  }
)

ConversationOperations.displayName = 'ConversationOperations'
