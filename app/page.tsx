import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="dark min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-6 py-2">
        <div className="text-3xl font-bold">AI Chat</div>

        <Link href="/login">
          <Button className="cursor-pointer">登录</Button>
        </Link>
      </header>

      <div className="w-11/12 md:w-9/12 mx-auto my-10">
        <picture>
          <img src="/img/chat-dark.png" alt="" className="w-full" />
        </picture>
      </div>

      <p className="text-center text-lg">一个使用 next 开发 AI 对话页面完善中...</p>
    </div>
  )
}
