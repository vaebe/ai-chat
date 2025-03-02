'use client'

import React, { useState } from 'react'
import { FullScreenLoading } from '@/components/screen-loading'
import { GithubLoginButton } from './GithubLoginButton'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const LoginDialog = ({ isOpen, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>登录</DialogTitle>
        </DialogHeader>

        <FullScreenLoading isLoading={isLoading} message="正在登录..."></FullScreenLoading>

        <GithubLoginButton setIsLoading={setIsLoading} />
      </DialogContent>
    </Dialog>
  )
}

export { LoginDialog }
export default LoginDialog
