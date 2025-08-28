'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { KeySquare, Key } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { useTheme } from 'next-themes'

export default function Home() {
  const { theme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen dark:bg-black dark:text-white">
      <header className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center">
          <img
            src={theme === 'dark' ? '/logo/light.svg' : '/logo/dark.svg'}
            alt="logo"
            width={38}
            height={38}
          />
          <div className="text-3xl font-bold">Chat</div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeSwitch></ThemeSwitch>

          <Link href="/sign-up">
            <Button className="cursor-pointer" variant="outline" size="sm">
              <Key />
              注册
            </Button>
          </Link>

          <Link href="/sign-in">
            <Button className="cursor-pointer" variant="outline" size="sm">
              <KeySquare />
              登录
            </Button>
          </Link>
        </div>
      </header>

      <div className="w-11/12 md:w-9/12 mx-auto my-10">
        <Image
          src="/img/chat-dark.png"
          alt="聊天示例"
          className="w-full"
          width={1200}
          height={664}
          priority
        />
      </div>

      <p className="text-center text-lg">一个使用 next 开发 AI 对话页面完善中...</p>
    </div>
  )
}
