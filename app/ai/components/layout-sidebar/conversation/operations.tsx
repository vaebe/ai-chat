import React, { useState } from 'react'
import { AiConversation } from '@/generated/prisma/client'
import { useOperations } from './use-operations'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ConversationOperationsProps {
  conversation: AiConversation
  className?: string
  onMenuOpenChange?: (open: boolean) => void
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

function RemoveConversationDialog({ conversation, dialog }: { conversation: AiConversation; dialog: UseShowHideRes }) {
  const { removeConversation } = useOperations()

  const handleRemove = async () => {
    await removeConversation(conversation)
    dialog.hide()
  }

  return (
    <Dialog onOpenChange={dialog.toggle} open={dialog.visible}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除聊天</DialogTitle>
          <DialogDescription>这会删除 &quot;{conversation.name}&quot;。</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="secondary" className="cursor-pointer" onClick={dialog.hide}>
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

function EditConversationDialog({ conversation, dialog }: { conversation: AiConversation; dialog: UseShowHideRes }) {
  const { updateConversation } = useOperations()
  const [name, setName] = useState(conversation.name)

  function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.warning('对话标题不能为空！')
      return
    }

    // 相同直接关闭
    if (trimmedName === conversation.name) {
      dialog.hide()
      return
    }

    updateConversation(conversation, trimmedName)
    dialog.hide()
  }

  return (
    <Dialog onOpenChange={dialog.toggle} open={dialog.visible}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑对话名称</DialogTitle>
        </DialogHeader>

        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />

        <DialogFooter>
          <Button className="cursor-pointer" type="button" variant="secondary" onClick={dialog.hide}>
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
  ({ className, conversation, onMenuOpenChange }) => {
    const deleteDialog = useShowHide()

    const editDialog = useShowHide()

    return (
      <>
        <DropdownMenu onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <div className={cn('w-5 h-5 rounded hover:bg-white hover:text-blue-500 cursor-pointer', className)}>
              <Icon icon="dashicons:ellipsis" className="w-5 mt-0.5" />
            </div>
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
